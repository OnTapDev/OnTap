"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";

export type SetupProgress = {
  insurance: {
    liquorLiability: boolean;
    generalLiability: boolean;
    commercialAuto: boolean;
  };
  formation: {
    entityType: string | null;
    registered: boolean;
    bankAccount: boolean;
  };
  permits: {
    liquorLicense: boolean;
    cateringPermit: boolean;
    businessLicense: boolean;
  };
};

const COLUMN_MAP: Record<string, Record<string, string>> = {
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

function defaultProgress(): SetupProgress {
  return {
    insurance: { liquorLiability: false, generalLiability: false, commercialAuto: false },
    formation: { entityType: null, registered: false, bankAccount: false },
    permits: { liquorLicense: false, cateringPermit: false, businessLicense: false },
  };
}

export async function getSetupProgress(orgId: string): Promise<SetupProgress> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_setup_progress")
    .select("*")
    .eq("user_id", orgId)
    .single();

  if (error || !data) {
    return defaultProgress();
  }

  return {
    insurance: {
      liquorLiability: data.insurance_liquor || false,
      generalLiability: data.insurance_general || false,
      commercialAuto: data.insurance_auto || false,
    },
    formation: {
      entityType: data.formation_entity || null,
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

export async function saveSetupProgressItem(
  orgId: string,
  section: string,
  item: string,
  value: boolean
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const column = COLUMN_MAP[section]?.[item];
  if (!column) return { success: false };

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

  revalidatePath("/profile");
  return { success: true };
}
