import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { SubscriptionError } from "./SubscriptionError";
import { SubscriptionClient } from "./SubscriptionClient";

export const dynamic = "force-dynamic";

async function resolveOrg(clerkId: string, email: string, name: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: userRecord } = await supabase
    .from("users")
    .select("org_id")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  let orgId = userRecord?.org_id;

  if (orgId) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id, name, stripe_subscription_status")
      .eq("id", orgId)
      .maybeSingle();

    if (org) {
      if (org.stripe_subscription_status === "active" || org.stripe_subscription_status === "trialing") {
        return { redirect: "/dashboard", orgId: org.id, orgName: org.name };
      }
      return { orgId: org.id, orgName: org.name };
    }
  }

  orgId = randomUUID();

  const { error: orgError } = await supabase.from("organizations").insert({
    id: orgId,
    name: name || "My Bar Company",
    slug: `bar-${Date.now()}`,
  });
  if (orgError) throw new Error(`Failed to create organization: ${orgError.message}`);

  const { error: userError } = await supabase.from("users").insert({
    org_id: orgId,
    clerk_id: clerkId,
    email: email || "",
    name: name || "",
    role: "owner",
  });
  if (userError) throw new Error(`Failed to create user: ${userError.message}`);

  const stages = [
    { name: "New Inquiry", order: 0, color: "#7D7254" },
    { name: "Quoted", order: 1, color: "#B2A88A" },
    { name: "Tentative", order: 2, color: "#F3E7D3" },
    { name: "Booked", order: 3, color: "#7D6854" },
    { name: "Completed", order: 4, color: "#7D7254" },
  ];
  for (const stage of stages) {
    const { error: stageError } = await supabase.from("pipeline_stages").insert({ org_id: orgId, ...stage });
    if (stageError) throw new Error(`Failed to create pipeline stage: ${stageError.message}`);
  }

  return { orgId, orgName: name || "My Bar Company" };
}

export default async function SubscriptionPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const clerkId = user.id;
  const email = user.emailAddresses?.[0]?.emailAddress || "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || email;

  try {
    const result = await resolveOrg(clerkId, email, name);

    if (result.redirect) {
      redirect(result.redirect);
    }

    return <SubscriptionClient orgId={result.orgId} orgName={result.orgName} />;
  } catch (error) {
    console.error("Subscription page error:", error);
    return <SubscriptionError message={error instanceof Error ? error.message : "Unknown error"} />;
  }
}
