import { stripe } from "@/core/payment/stripe";
import { createClient } from "@/core/db/server";
import { NextRequest, NextResponse } from "next/server";

async function updateSubscription(orgId: string, data: {
  stripe_subscription_id?: string;
  stripe_subscription_status?: string;
  stripe_subscription_period_end?: string;
}) {
  const supabase = await createClient();
  return supabase.from("organizations").update(data).eq("id", orgId);
}

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    const event = (() => {
      const secrets = [
        process.env.STRIPE_WEBHOOK_SECRET,
        process.env.STRIPE_PLATFORM_WEBHOOK_SECRET,
      ].filter(Boolean) as string[];

      for (const secret of secrets) {
        try {
          return stripe!.webhooks.constructEvent(body, signature!, secret);
        } catch {
          // Try next secret
        }
      }
      return null;
    })();

    if (!event) {
      console.error("Webhook signature verification failed with all secrets");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await createClient();

    switch (event.type) {

      // === Invoice payments (one-time) ===
      case "checkout.session.completed": {
        const session = event.data.object;
        const invoiceId = session.metadata?.invoice_id;
        const orgId = session.metadata?.org_id;

        if (session.mode === "payment" && invoiceId && orgId) {
          await supabase
            .from("invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_payment_status: "succeeded",
            })
            .eq("id", invoiceId)
            .eq("org_id", orgId);
        }

        if (session.mode === "subscription") {
          const subId = session.subscription;
          const sub = typeof subId === "string"
            ? await stripe.subscriptions.retrieve(subId)
            : subId;

          if (!sub) break;
          const orgIdFromMeta = session.metadata?.org_id || sub.metadata?.org_id;
          if (orgIdFromMeta) {
            await updateSubscription(orgIdFromMeta, {
              stripe_subscription_id: sub.id,
              stripe_subscription_status: sub.status,
              stripe_subscription_period_end: new Date(
                (sub.current_period_end || 0) * 1000
              ).toISOString(),
            });
          }
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const invoiceId = session.metadata?.invoice_id;
        if (invoiceId) {
          await supabase
            .from("invoices")
            .update({ stripe_payment_status: "expired" })
            .eq("id", invoiceId);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const invoiceId = paymentIntent.metadata?.invoice_id;
        if (invoiceId) {
          await supabase
            .from("invoices")
            .update({ stripe_payment_status: "failed" })
            .eq("id", invoiceId);
        }
        break;
      }

      // === Subscriptions ===
      case "invoice.paid": {
        const invoice = event.data.object;
        const subId = invoice.subscription;
        const orgId = invoice.metadata?.org_id;

        if (orgId && subId) {
          const sub = await stripe.subscriptions.retrieve(
            typeof subId === "string" ? subId : subId.id
          );
          await updateSubscription(orgId, {
            stripe_subscription_status: sub.status,
            stripe_subscription_period_end: new Date(
              (sub.current_period_end || 0) * 1000
            ).toISOString(),
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const failedInvoice = event.data.object;
        const failedOrgId = failedInvoice.metadata?.org_id;
        if (failedOrgId) {
          await supabase
            .from("organizations")
            .update({ stripe_subscription_status: "past_due" })
            .eq("id", failedOrgId);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        if (!sub) break;
        const subOrgId = sub.metadata?.org_id;
        if (subOrgId) {
          await updateSubscription(subOrgId, {
            stripe_subscription_id: sub.id,
            stripe_subscription_status: sub.status === "active" || sub.status === "trialing" ? sub.status : "inactive",
            stripe_subscription_period_end: sub.status === "canceled" || sub.status === "unpaid"
              ? undefined
              : new Date((sub.current_period_end || 0) * 1000).toISOString(),
          });
        }
        break;
      }

      // === Stripe Connect ===
      case "account.updated": {
        const account = event.data.object;
        const accountId = account.id;
        const chargesEnabled = account.charges_enabled;
        const transfersEnabled = account.capabilities?.transfers === "active";
        const detailsSubmitted = account.details_submitted;
        const status = chargesEnabled && transfersEnabled && detailsSubmitted
          ? "complete"
          : detailsSubmitted ? "pending" : "incomplete";
        await supabase
          .from("organizations")
          .update({ stripe_account_status: status })
          .eq("stripe_account_id", accountId);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
