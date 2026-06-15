import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const supabase = createAdminClient();

  // Check if demo-organization exists
  const { data: existing } = await supabase
    .from("organizations")
    .select("id, slug, name")
    .eq("slug", "demo-bar")
    .single();

  if (existing) {
    return NextResponse.json({ 
      slug: existing.slug, 
      name: existing.name,
      message: "Demo organization already exists"
    });
  }

  // Create demo organization
  const { data: newOrg, error } = await supabase
    .from("organizations")
    .insert({
      name: "Demo Mobile Bar",
      slug: "demo-bar",
      description: "A demo mobile bar service for testing the booking flow",
      city: "San Francisco",
      state: "CA",
      service_area: "Bay Area",
      default_hourly_rate: 150,
      minimum_booking_hours: 4,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create sample packages
  if (newOrg) {
    await supabase.from("packages").insert([
      {
        org_id: newOrg.id,
        name: "Classic Cocktail Bar",
        description: "2 professional bartenders, full bar setup, premium spirits",
        base_price: 150,
        pricing_type: "hourly",
        includes_bartenders: 2,
        includes_glassware: true,
        is_active: true,
      },
      {
        org_id: newOrg.id,
        name: "Premium Experience",
        description: "3 bartenders, top-shelf spirits, signature cocktails",
        base_price: 250,
        pricing_type: "hourly",
        includes_bartenders: 3,
        includes_glassware: true,
        is_active: true,
      },
      {
        org_id: newOrg.id,
        name: "Beer & Wine Only",
        description: "2 bartenders, selection of craft beers and wines",
        base_price: 100,
        pricing_type: "hourly",
        includes_bartenders: 2,
        is_active: true,
      },
    ]);
  }

  return NextResponse.json({ 
    slug: "demo-bar", 
    name: newOrg?.name,
    message: "Demo organization created"
  });
}