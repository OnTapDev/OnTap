"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export type QuoteResponseResult = {
  success: boolean;
  message: string;
};

export async function respondToQuote(quoteId: string, action: "accept" | "reject"): Promise<QuoteResponseResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: quote } = await supabase
    .from("quotes")
    .select("id, org_id, event_id, total, status")
    .eq("id", quoteId)
    .maybeSingle();

  if (!quote) {
    return { success: false, message: "Quote not found." };
  }

  if (quote.status === "accepted" || quote.status === "rejected") {
    return { success: false, message: `This quote has already been ${quote.status}.` };
  }

  if (quote.status === "expired") {
    return { success: false, message: "This quote has expired and can no longer be responded to." };
  }

  const newStatus = action === "accept" ? "accepted" : "rejected";

  const { error: updateError } = await supabase
    .from("quotes")
    .update({ status: newStatus })
    .eq("id", quoteId);

  if (updateError) {
    return { success: false, message: "Failed to update quote status." };
  }

  let invoiceCreated = false;

  if (action === "accept" && quote.event_id) {
    const { error: invoiceError } = await supabase.from("invoices").insert({
      org_id: quote.org_id,
      event_id: quote.event_id,
      quote_id: quoteId,
      amount: quote.total,
      deposit_amount: 0,
      balance_due: quote.total,
      status: "sent",
    });

    if (!invoiceError) {
      invoiceCreated = true;
      await supabase.from("events").update({ total_price: quote.total, status: "booked" }).eq("id", quote.event_id);
    }
  }

  revalidatePath("/quotes");
  revalidatePath("/billing");
  revalidatePath(`/public/quote/${quoteId}`);

  return {
    success: true,
    message:
      action === "accept"
        ? invoiceCreated
          ? "Thank you — your quote has been accepted. An invoice has been created and is ready for payment."
          : "Thank you — your quote has been accepted."
        : "This quote has been declined.",
  };
}