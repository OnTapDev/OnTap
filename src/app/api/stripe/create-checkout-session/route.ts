import { stripe, PLATFORM_FEE_PERCENTAGE, PLATFORM_APP_URL } from "@/core/payment/stripe";
import { createClient } from "@/core/db/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }
    const { invoiceId } = await req.json();
    if (!invoiceId) {
      return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: invoice } = await supabase
      .from("invoices")
      .select(`
        *,
        event:events(name, date, venue_name),
        organization:organizations(id, name, stripe_account_id)
      `)
      .eq("id", invoiceId)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "paid" || invoice.status === "cancelled") {
      return NextResponse.json({ error: "Invoice is already paid or cancelled" }, { status: 400 });
    }

    const org = invoice.organization;
    if (!org?.stripe_account_id) {
      return NextResponse.json({ error: "Operator has not connected their Stripe account" }, { status: 400 });
    }

    const amountInCents = Math.round(invoice.balance_due * 100);
    const feeInCents = Math.round(amountInCents * PLATFORM_FEE_PERCENTAGE);

    // Direct charge on the operator's connected account
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Invoice #${invoiceId.slice(0, 8).toUpperCase()}`,
              description: invoice.event?.name
                ? `Bar services for ${invoice.event.name}`
                : undefined,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: feeInCents,
      },
      metadata: {
        invoice_id: invoiceId,
        org_id: invoice.org_id,
        operator_name: org.name || org.stripe_account_id,
      },
      success_url: `${PLATFORM_APP_URL}/invoices?payment=success&invoice=${invoiceId}`,
      cancel_url: `${PLATFORM_APP_URL}/invoices?payment=cancelled&invoice=${invoiceId}`,
    }, {
      stripeAccount: org.stripe_account_id,
    });

    await supabase
      .from("invoices")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", invoiceId);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
