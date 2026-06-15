"use server";

import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getSetupProgress(orgId: string | null) {
  const supabase = createAdminClient();
  
  if (!orgId || orgId === "demo-org") {
    return getDefaultProgress();
  }

  const { data, error } = await supabase
    .from("user_setup_progress")
    .select("*")
    .eq("user_id", orgId)
    .single();

  if (error || !data) {
    return getDefaultProgress();
  }

  return {
    insurance: {
      liquorLiability: data.insurance_liquor || false,
      generalLiability: data.insurance_general || false,
      commercialAuto: data.insurance_auto || false,
    },
    formation: {
      entityType: data.formation_entity,
      registered: data.formation_registered || false,
      bankAccount: data.formation_bank || false,
    },
    permits: {
      liquorLicense: data.permits_liquor || false,
      cateringPermit: data.permits_catering || false,
      businessLicense: data.permits_license || false,
    },
  };
}

export async function saveSetupProgress(
  orgId: string | null,
  section: string,
  item: string,
  value: boolean
): Promise<{ success: boolean }> {
  if (!orgId || orgId === "demo-org") {
    return { success: true };
  }

  const supabase = createAdminClient();
  
  const columnMap: Record<string, Record<string, string>> = {
    insurance: {
      liquorLiability: "insurance_liquor",
      generalLiability: "insurance_general",
      commercialAuto: "insurance_auto",
    },
    formation: {
      entityType: "formation_entity",
      registered: "formation_registered",
      bankAccount: "formation_bank",
    },
    permits: {
      liquorLicense: "permits_liquor",
      cateringPermit: "permits_catering",
      businessLicense: "permits_license",
    },
  };

  const column = columnMap[section]?.[item];
  if (!column) {
    return { success: false };
  }

  // Upsert
  const { error } = await supabase
    .from("user_setup_progress")
    .upsert(
      { user_id: orgId, [column]: value },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Save progress error:", error);
    return { success: false };
  }

  return { success: true };
}

function getDefaultProgress() {
  return {
    insurance: {
      liquorLiability: false,
      generalLiability: false,
      commercialAuto: false,
    },
    formation: {
      entityType: null,
      registered: false,
      bankAccount: false,
    },
    permits: {
      liquorLicense: false,
      cateringPermit: false,
      businessLicense: false,
    },
  };
}