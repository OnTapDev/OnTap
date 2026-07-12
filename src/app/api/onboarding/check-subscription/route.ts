import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { orgId } = await request.json();
    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: org } = await supabase
      .from("organizations")
      .select("stripe_subscription_status")
      .eq("id", orgId)
      .maybeSingle();

    const active =
      org?.stripe_subscription_status === "active" ||
      org?.stripe_subscription_status === "trialing" ||
      org?.stripe_subscription_status === "free";

    return NextResponse.json({ active });
  } catch {
    return NextResponse.json({ active: false });
  }
}
