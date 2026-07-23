import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    const { clerkId, email, name } = await request.json();
    if (!clerkId) {
      return NextResponse.json({ error: "Missing clerkId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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
          return NextResponse.json({ redirect: "/dashboard" });
        }
        return NextResponse.json({ orgId: org.id, orgName: org.name });
      }
    }

    orgId = randomUUID();

    const { error: orgError } = await supabase.from("organizations").insert({
      id: orgId,
      name: name || "My Bar Company",
      slug: (name || "my-bar").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + `-${Date.now().toString(36)}`,
    });
    if (orgError) throw orgError;

    const { error: userError } = await supabase.from("users").insert({
      org_id: orgId,
      clerk_id: clerkId,
      email: email || "",
      name: name || "",
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
      await supabase.from("pipeline_stages").insert({ org_id: orgId, ...stage });
    }

    return NextResponse.json({ orgId, orgName: name || "My Bar Company" });
  } catch (error) {
    console.error("Resolve org error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to resolve organization" },
      { status: 500 }
    );
  }
}
