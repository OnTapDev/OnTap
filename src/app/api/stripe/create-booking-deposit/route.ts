import { stripe, PLATFORM_FEE_PERCENTAGE, PLATFORM_APP_URL } from "@/core/payment/stripe";
import { createClient } from "@/core/db/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const { eventId, orgId, contactEmail, contactName } = await req.json();
    if (!eventId || !orgId) {
      return NextResponse.json({ error: "Missing eventId or orgId" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: event } = await supabase
      .from("events")
      .select(`
        *,
        organization:organizations(id, name, stripe_account_id)
      `)
      .eq("id", eventId)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.stripe_deposit_paid) {
      return NextResponse.json({ error: "Deposit already paid" }, { status: 400 });
    }

    const org = event.organization;
    if (!org?.stripe_account_id) {
      return NextResponse.json({ error: "Operator has not connected their Stripe account" }, { status: 400 });
    }

    const depositAmount = Math.round((event.total_price || 0) * 0.25);
    if (depositAmount <= 0) {
      return NextResponse.json({ error: "No deposit required" }, { status: 400 });
    }

    const amountInCents = Math.round(depositAmount * 100);
    const feeInCents = Math.round(amountInCents * PLATFORM_FEE_PERCENTAGE);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Deposit for ${event.name}`,
              description: `25% deposit for bar services on ${new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
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
        event_id: eventId,
        org_id: orgId,
        type: "booking_deposit",
        contact_email: contactEmail || "",
        contact_name: contactName || "",
      },
      success_url: `${PLATFORM_APP_URL}/book/${org.slug}?deposit=success&event=${eventId}`,
      cancel_url: `${PLATFORM_APP_URL}/book/${org.slug}?deposit=cancelled&event=${eventId}`,
    }, {
      stripeAccount: org.stripe_account_id,
    });

    await supabase
      .from("events")
      .update({ stripe_deposit_session_id: session.id, deposit_amount: depositAmount })
      .eq("id", eventId);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating deposit session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create deposit session" },
      { status: 500 }
    );
  }
}
