"use server";

import { createClient } from "@/core/db/server";

export async function exportInvoicesCSV(orgId: string) {
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      id, amount, deposit_amount, balance_due, status, due_date, paid_at, created_at,
      stripe_checkout_session_id, stripe_payment_status,
      event:events(name, date, venue_name)
    `)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (!invoices || invoices.length === 0) return null;

  const headers = [
    "Invoice ID", "Event", "Event Date", "Venue",
    "Amount", "Deposit", "Balance Due", "Status",
    "Due Date", "Paid At", "Payment Status", "Created At",
  ];

  const rows = invoices.map((inv) => {
    const events = Array.isArray(inv.event) ? inv.event : [inv.event].filter(Boolean);
    const ev = events[0] || {};
    return [
      inv.id,
      ev.name || "",
      ev.date || "",
      ev.venue_name || "",
      inv.amount.toString(),
      (inv.deposit_amount || 0).toString(),
      inv.balance_due.toString(),
      inv.status,
      inv.due_date || "",
      inv.paid_at || "",
      inv.stripe_payment_status || "",
      inv.created_at,
    ];
  });

  const csv = [
    headers.join(","),
    ...rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return csv;
}
