"use server";

import { stripe, PLATFORM_APP_URL } from "@/core/payment/stripe";
import { createClient } from "@/core/db/server";

export async function createStripeConnectLink(orgId: string) {
  if (!stripe) throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_account_id, stripe_account_status, name")
    .eq("id", orgId)
    .single();

  if (!org) throw new Error("Organization not found");

  if (org.stripe_account_id && org.stripe_account_status === "complete") {
    return { url: null, status: "complete" as const };
  }

  try {
    if (!org.stripe_account_id) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: undefined,
        business_type: "individual",
        business_profile: {
          name: org.name || undefined,
          url: PLATFORM_APP_URL,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      await supabase
        .from("organizations")
        .update({ stripe_account_id: account.id, stripe_account_status: "pending" })
        .eq("id", orgId);

      const link = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${PLATFORM_APP_URL}/settings?tab=integrations`,
        return_url: `${PLATFORM_APP_URL}/settings?tab=integrations`,
        type: "account_onboarding",
      });

      return { url: link.url, status: "onboarding" as const };
    }

    const link = await stripe.accountLinks.create({
      account: org.stripe_account_id,
      refresh_url: `${PLATFORM_APP_URL}/settings?tab=integrations`,
      return_url: `${PLATFORM_APP_URL}/settings?tab=integrations`,
      type: "account_onboarding",
    });

    return { url: link.url, status: "onboarding" as const };
  } catch (error) {
    console.error("Error creating Stripe Connect link:", error);
    throw new Error("Failed to create Stripe Connect onboarding link");
  }
}

export async function getStripeConnectStatus(orgId: string) {
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_account_id, stripe_account_status")
    .eq("id", orgId)
    .single();

  if (!org) return { connected: false, status: null };

  return {
    connected: !!org.stripe_account_id && org.stripe_account_status === "complete",
    status: org.stripe_account_status,
    accountId: org.stripe_account_id,
  };
}

export async function disconnectStripe(orgId: string) {
  if (!stripe) throw new Error("Stripe is not configured");
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_account_id")
    .eq("id", orgId)
    .single();

  if (org?.stripe_account_id) {
    try {
      await stripe.accounts.update(org.stripe_account_id, {
        capabilities: {
          card_payments: { requested: false },
          transfers: { requested: false },
        },
      });
    } catch {
      // Account might already be closed
    }
  }

  await supabase
    .from("organizations")
    .update({ stripe_account_id: null, stripe_account_status: "disconnected" })
    .eq("id", orgId);

  return { success: true };
}
