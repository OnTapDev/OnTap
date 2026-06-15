import { NextResponse } from "next/server";
import { getUserOrgId } from "@/lib/auth";
import { saveSetupProgress } from "@/app/(dashboard)/business-setup/actions";

export async function POST(request: Request) {
  try {
    const orgId = await getUserOrgId();
    const { section, item, value } = await request.json();

    const result = await saveSetupProgress(orgId, section, item, value);

    if (!result.success) {
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}