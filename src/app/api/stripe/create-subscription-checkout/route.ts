import { stripe, PLATFORM_APP_URL } from "@/core/payment/stripe";
import { createClient } from "@/core/db/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const { orgId } = await req.json();
    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: org } = await supabase
      .from("organizations")
      .select("id, name, email, stripe_customer_id")
      .eq("id", orgId)
      .maybeSingle();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    let customerId = org.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        name: org.name || undefined,
        email: org.email || undefined,
        metadata: { org_id: org.id },
      });
      customerId = customer.id;

      await supabase
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", orgId);
    }

    const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "Subscription price not configured" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { org_id: org.id },
      subscription_data: {
        metadata: { org_id: org.id },
      },
      success_url: `${PLATFORM_APP_URL}/onboarding/processing?orgId=${org.id}`,
      cancel_url: `${PLATFORM_APP_URL}/onboarding/subscription`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating subscription checkout:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create subscription checkout" },
      { status: 500 }
    );
  }
}
