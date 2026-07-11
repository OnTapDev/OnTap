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
      .select("stripe_customer_id")
      .eq("id", orgId)
      .single();

    if (!org?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${PLATFORM_APP_URL}/settings?tab=payments`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create portal session" },
      { status: 500 }
    );
  }
}
