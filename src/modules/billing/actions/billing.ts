"use server";

import { createClient } from "@/core/db/server";

export async function getBillingKPIs(orgId: string) {
  const supabase = await createClient();
  const today = new Date();
  const { data: allInvoices } = await supabase
    .from("invoices")
    .select("id, amount, deposit_amount, balance_due, status, due_date, created_at, paid_at")
    .eq("org_id", orgId);

  const invoices = allInvoices || [];

  const totalOutstanding = invoices
    .filter(i => i.status !== "paid" && i.status !== "cancelled")
    .reduce((sum, i) => sum + (i.balance_due || 0), 0);

  const totalPaid = invoices
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  const overdueCount = invoices.filter(i =>
    i.status !== "paid" && i.status !== "cancelled" &&
    i.due_date && new Date(i.due_date) < today
  ).length;

  const quotesResult = await supabase
    .from("quotes")
    .select("total, status, created_at")
    .eq("org_id", orgId);
  const quotes = quotesResult.data || [];

  const totalQuoted = quotes
    .filter(q => q.status !== "rejected" && q.status !== "expired")
    .reduce((sum, q) => sum + (q.total || 0), 0);

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;

  const recentOutstanding = invoices.filter(i =>
    i.status !== "paid" && i.status !== "cancelled" &&
    new Date(i.created_at).getTime() > today.getTime() - thirtyDaysMs
  ).reduce((sum, i) => sum + (i.balance_due || 0), 0);

  const priorOutstanding = invoices.filter(i =>
    i.status !== "paid" && i.status !== "cancelled" &&
    new Date(i.created_at).getTime() > today.getTime() - sixtyDaysMs &&
    new Date(i.created_at).getTime() <= today.getTime() - thirtyDaysMs
  ).reduce((sum, i) => sum + (i.balance_due || 0), 0);

  const outstandingChange = priorOutstanding > 0
    ? Math.round(((recentOutstanding - priorOutstanding) / priorOutstanding) * 100)
    : recentOutstanding > 0 ? 100 : 0;

  const recentPaid = invoices.filter(i =>
    i.status === "paid" &&
    i.paid_at && new Date(i.paid_at).getTime() > today.getTime() - thirtyDaysMs
  ).reduce((sum, i) => sum + (i.amount || 0), 0);

  const priorPaid = invoices.filter(i =>
    i.status === "paid" &&
    i.paid_at && new Date(i.paid_at).getTime() > today.getTime() - sixtyDaysMs &&
    new Date(i.paid_at).getTime() <= today.getTime() - thirtyDaysMs
  ).reduce((sum, i) => sum + (i.amount || 0), 0);

  const paidChange = priorPaid > 0
    ? Math.round(((recentPaid - priorPaid) / priorPaid) * 100)
    : recentPaid > 0 ? 100 : 0;

  const recentQuoted = quotes.filter(q =>
    q.status !== "rejected" && q.status !== "expired" &&
    new Date(q.created_at).getTime() > today.getTime() - thirtyDaysMs
  ).reduce((sum, q) => sum + (q.total || 0), 0);

  const priorQuoted = quotes.filter(q =>
    q.status !== "rejected" && q.status !== "expired" &&
    new Date(q.created_at).getTime() > today.getTime() - sixtyDaysMs &&
    new Date(q.created_at).getTime() <= today.getTime() - thirtyDaysMs
  ).reduce((sum, q) => sum + (q.total || 0), 0);

  const quotedChange = priorQuoted > 0
    ? Math.round(((recentQuoted - priorQuoted) / priorQuoted) * 100)
    : recentQuoted > 0 ? 100 : 0;

  const overdueChange = 0;

  const generateChartData = (items: { created_at?: string; paid_at?: string; amount: number }[], label: string, days: number = 30): number[] => {
    const data: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = date.toISOString().split("T")[0];
      const dayTotal = items
        .filter(it => {
          const dateField = label === "paid" ? it.paid_at : it.created_at;
          return dateField && dateField.startsWith(dayStart);
        })
        .reduce((s, it) => s + (it.amount || 0), 0);
      data.push(dayTotal);
    }
    return data;
  };

  const generateCountChart = (items: { created_at?: string }[], days: number = 30): number[] => {
    const data: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = date.toISOString().split("T")[0];
      const count = items.filter(it => it.created_at && it.created_at.startsWith(dayStart)).length;
      data.push(count);
    }
    return data;
  };

  const paidInvoicesWithDate = invoices
    .filter(i => i.status === "paid" && i.paid_at)
    .map(i => ({ paid_at: i.paid_at!, amount: i.amount || 0 }));

  const outstandingInvoicesWithDate = invoices
    .filter(i => i.status !== "paid" && i.status !== "cancelled")
    .map(i => ({ created_at: i.created_at, amount: i.balance_due || 0 }));

  const quotedWithDate = quotes
    .filter(q => q.status !== "rejected" && q.status !== "expired")
    .map(q => ({ created_at: q.created_at, amount: q.total || 0 }));

  return {
    "total-outstanding": {
      value: totalOutstanding,
      change: `${outstandingChange >= 0 ? "+" : ""}${outstandingChange}%`,
      chartData: generateChartData(outstandingInvoicesWithDate, "outstanding"),
    },
    "total-paid": {
      value: totalPaid,
      change: `${paidChange >= 0 ? "+" : ""}${paidChange}%`,
      chartData: generateChartData(paidInvoicesWithDate, "paid"),
    },
    "total-quoted": {
      value: totalQuoted,
      change: `${quotedChange >= 0 ? "+" : ""}${quotedChange}%`,
      chartData: generateChartData(quotedWithDate, "quoted"),
    },
    "overdue-count": {
      value: overdueCount,
      change: `${overdueChange >= 0 ? "+" : ""}${overdueChange}`,
      chartData: generateCountChart(invoices.filter(i =>
        i.status !== "paid" && i.status !== "cancelled" && i.due_date && new Date(i.due_date) < today
      )),
    },
  };
}
