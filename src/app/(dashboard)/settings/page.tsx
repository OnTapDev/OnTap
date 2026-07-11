import { SettingsClient } from "@/modules/settings/components/SettingsClient";
import { currentUser } from "@clerk/nextjs/server";
import { getUserPreferences } from "@/lib/preferences/actions";
import { getUserTickets } from "@/lib/support/actions";
import { getUserOrgId } from "@/lib/auth";
import { getStripeConnectStatus } from "@/modules/settings/actions/stripe-connect";
import { createClient } from "@/core/db/server";

export default async function SettingsPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress || null;
  const emailVerified = user?.emailAddresses?.[0]?.verification?.status === "verified";
  
  const preferences = await getUserPreferences();
  const tickets = await getUserTickets();
  const orgId = await getUserOrgId();
  const stripeStatus = orgId ? await getStripeConnectStatus(orgId) : { connected: false, status: null };

  let subscriptionStatus: { status: string; periodEnd?: string; subscriberCount?: number } | undefined;
  if (orgId) {
    const supabase = await createClient();
    const { data: org } = await supabase
      .from("organizations")
      .select("stripe_subscription_status, stripe_subscription_period_end")
      .eq("id", orgId)
      .single();
    if (org) {
      subscriptionStatus = {
        status: org.stripe_subscription_status || "inactive",
        periodEnd: org.stripe_subscription_period_end || undefined,
      };
    }

    const { count } = await supabase
      .from("organizations")
      .select("*", { count: "exact", head: true })
      .eq("stripe_subscription_status", "active");

    if (subscriptionStatus) {
      subscriptionStatus.subscriberCount = count || 0;
    }
  }

  return (
    <SettingsClient
      userEmail={email}
      emailVerified={emailVerified}
      preferences={preferences}
      tickets={tickets}
      orgId={orgId || undefined}
      stripeConnectStatus={stripeStatus}
      subscriptionStatus={subscriptionStatus}
    />
  );
}
