import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/core/db/server";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { SubscriptionClient } from "./SubscriptionClient";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const clerkId = user.id;
  const email = user.emailAddresses?.[0]?.emailAddress || "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || email;

  const supabase = await createClient();

  const { data: userRecord } = await supabase
    .from("users")
    .select("org_id")
    .eq("clerk_id", clerkId)
    .single();

  let orgId = userRecord?.org_id;
  let org: { id: string; stripe_subscription_status: string | null; name: string } | null = null;

  if (orgId) {
    const { data: o } = await supabase
      .from("organizations")
      .select("id, stripe_subscription_status, name")
      .eq("id", orgId)
      .single();
    org = o;
  }

  if (!orgId || !org) {
    orgId = crypto.randomUUID();

    const { error: orgError } = await supabase.from("organizations").insert({
      id: orgId,
      name: name || "My Bar Company",
      slug: `bar-${Date.now()}`,
    });
    if (orgError) throw orgError;

    const { error: userError } = await supabase.from("users").insert({
      org_id: orgId,
      clerk_id: clerkId,
      email,
      name,
      role: "owner",
    });
    if (userError) throw userError;

    const stages = [
      { name: "New Inquiry", order: 0, color: "#7D7254" },
      { name: "Quoted", order: 1, color: "#B2A88A" },
      { name: "Tentative", order: 2, color: "#F3E7D3" },
      { name: "Booked", order: 3, color: "#7D6854" },
      { name: "Completed", order: 4, color: "#7D7254" },
    ];
    for (const stage of stages) {
      await supabase.from("pipeline_stages").insert({
        org_id: orgId,
        ...stage,
      });
    }

    org = { id: orgId, stripe_subscription_status: null, name: name || "My Bar Company" };
  }

  if (org.stripe_subscription_status === "active" || org.stripe_subscription_status === "trialing") {
    redirect("/dashboard");
  }

  return <SubscriptionClient orgId={org.id} orgName={org.name} />;
}
