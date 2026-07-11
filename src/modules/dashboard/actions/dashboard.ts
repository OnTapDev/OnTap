"use server";

import { createClient } from "@/core/db/server";

function getDateRange(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export async function getDashboardKPIs(orgId: string) {
  const supabase = await createClient();
  const today = getDateRange(0);
  const thirtyDaysAgo = getDateRange(30);
  const sixtyDaysAgo = getDateRange(60);
  const thirtyDaysFromNow = getDateRange(-30);

  // ── Bulk fetch all data needed for KPIs and charts ──
  const [
    allContacts,
    allPaidInvoices,
    upcomingEvents,
    oldSignedContracts,
    newSignedContracts,
    oldQuotes,
    newQuotes,
  ] = await Promise.all([
    // All contacts from last 60 days (for leads count + chart)
    supabase
      .from("contacts")
      .select("created_at")
      .eq("org_id", orgId)
      .gte("created_at", sixtyDaysAgo),

    // All paid invoices from last 60 days (for revenue + chart)
    supabase
      .from("invoices")
      .select("amount, created_at")
      .eq("org_id", orgId)
      .eq("status", "paid")
      .gte("created_at", sixtyDaysAgo),

    // Upcoming events in next 30 days
    supabase
      .from("events")
      .select("id, date")
      .eq("org_id", orgId)
      .gte("date", today)
      .lte("date", thirtyDaysFromNow),

    // Old signed contracts (31-60 days ago)
    supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "signed")
      .gte("created_at", sixtyDaysAgo)
      .lt("created_at", thirtyDaysAgo),

    // New signed contracts (0-30 days ago)
    supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "signed")
      .gte("created_at", thirtyDaysAgo),

    // Old quotes (31-60 days ago)
    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .gte("created_at", sixtyDaysAgo)
      .lt("created_at", thirtyDaysAgo),

    // New quotes (0-30 days ago)
    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .gte("created_at", thirtyDaysAgo),
  ]);

  // ── Process data in JS instead of per-day DB queries ──

  // Leads counts
  const contactsLast30 = (allContacts.data || []).filter(
    c => c.created_at >= thirtyDaysAgo
  ).length;
  const contactsPrev30 = (allContacts.data || []).filter(
    c => c.created_at >= sixtyDaysAgo && c.created_at < thirtyDaysAgo
  ).length;

  // Generate cumulative leads chart data
  const leadsChartData = generateCumulativeDaily(
    (allContacts.data || []).map(c => c.created_at),
    30
  );

  // Revenue
  const revenueLast30 = (allPaidInvoices.data || [])
    .filter(i => i.created_at >= thirtyDaysAgo)
    .reduce((s, i) => s + (i.amount || 0), 0);
  const revenuePrev30 = (allPaidInvoices.data || [])
    .filter(i => i.created_at >= sixtyDaysAgo && i.created_at < thirtyDaysAgo)
    .reduce((s, i) => s + (i.amount || 0), 0);

  // Generate cumulative revenue chart data
  const revenueChartData = generateCumulativeDailyRevenue(
    (allPaidInvoices.data || []).map(i => ({ amount: i.amount || 0, created_at: i.created_at })),
    30
  );

  // Upcoming events count
  const upcomingCount = upcomingEvents.data?.length || 0;

  // Events chart: use actual event dates from the upcoming events to create realistic distribution
  const eventDates = (upcomingEvents.data || []).map(e => e.date);
  const eventsChartData = generateCumulativeByDate(eventDates, 30);

  // Conversion rates
  const oldSignedCount = oldSignedContracts.count || 0;
  const newSignedCount = newSignedContracts.count || 0;
  const oldQuotesCount = oldQuotes.count || 0;
  const newQuotesCount = newQuotes.count || 0;

  const prevConversion = oldQuotesCount > 0 ? Math.round((oldSignedCount / oldQuotesCount) * 100) : 0;
  const currentConversion = newQuotesCount > 0 ? Math.round((newSignedCount / newQuotesCount) * 100) : 0;

  // Conversion chart: start from previous period and trend toward current
  const conversionChartData = generateConversionChart(prevConversion, currentConversion, 30);

  const leadsChange = contactsPrev30 > 0
    ? Math.round(((contactsLast30 - contactsPrev30) / contactsPrev30) * 100)
    : contactsLast30 > 0 ? 100 : 0;

  const revenueChange = revenuePrev30 > 0
    ? Math.round(((revenueLast30 - revenuePrev30) / revenuePrev30) * 100)
    : revenueLast30 > 0 ? 100 : 0;

  const conversionChange = prevConversion > 0
    ? currentConversion - prevConversion
    : currentConversion > 0 ? 100 : 0;

  return {
    leads: {
      value: contactsLast30,
      change: `${leadsChange >= 0 ? "+" : ""}${leadsChange}%`,
      chartData: leadsChartData,
    },
    revenue: {
      value: revenueLast30,
      change: `${revenueChange >= 0 ? "+" : ""}${revenueChange}%`,
      chartData: revenueChartData,
    },
    events: {
      value: upcomingCount,
      change: upcomingCount > 0 ? `+${Math.min(upcomingCount, 5)} upcoming` : "0 upcoming",
      chartData: eventsChartData,
    },
    conversion: {
      value: currentConversion,
      change: `${conversionChange >= 0 ? "+" : ""}${conversionChange}%`,
      chartData: conversionChartData,
    },
  };
}

function generateCumulativeDaily(dateStrs: string[], days: number): number[] {
  const data: number[] = [];
  let cumulative = 0;
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = date.toISOString().split("T")[0];

    const count = dateStrs.filter(d => d === dayStart).length;
    cumulative += count;
    data.push(cumulative);
  }
  return data;
}

function generateCumulativeDailyRevenue(
  items: { amount: number; created_at: string }[],
  days: number
): number[] {
  const data: number[] = [];
  let cumulative = 0;
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = date.toISOString().split("T")[0];

    const dayTotal = items
      .filter(it => it.created_at >= dayStart && it.created_at < dayStart + "T23:59:59")
      .reduce((s, it) => s + it.amount, 0);
    cumulative += dayTotal;
    data.push(cumulative);
  }
  return data;
}

function generateCumulativeByDate(dateStrs: string[], days: number): number[] {
  const data: number[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = date.toISOString().split("T")[0];

    if (dayStart >= getDateRange(0)) {
      data.push(dateStrs.filter(d => d === dayStart).length);
    } else {
      data.push(0);
    }
  }
  return data;
}

function generateConversionChart(prevRate: number, currentRate: number, days: number): number[] {
  const data: number[] = [];
  for (let i = 0; i < days; i++) {
    const t = i / (days - 1 || 1);
    data.push(Math.round(prevRate + (currentRate - prevRate) * t));
  }
  return data;
}

export async function getRecentLeads(orgId: string, limit = 5) {
  const supabase = await createClient();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, email, phone, source, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return contacts || [];
}

export async function getUpcomingEventsList(orgId: string, limit = 5) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: events } = await supabase
    .from("events")
    .select("id, name, date, status, guest_count, contacts!inner(name)")
    .eq("org_id", orgId)
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(limit);

  return (events || []).map(e => ({
    id: e.id,
    name: e.name,
    date: new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    status: e.status || "scheduled",
    guest_count: e.guest_count || 0,
    contact: e.contacts?.[0] ? { name: e.contacts[0].name } : null,
  }));
}

export async function getContactsForDashboard(orgId: string, limit = 10) {
  const supabase = await createClient();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, email, phone, company, role, source, notes, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return contacts || [];
}

export async function getEventsForDashboard(orgId: string, limit = 10) {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, name, date, status, guest_count")
    .eq("org_id", orgId)
    .order("date", { ascending: true })
    .limit(limit);

  return (events || []).map(e => ({
    id: e.id,
    name: e.name,
    date: new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    status: e.status || "scheduled",
    guest_count: e.guest_count || 0,
    contact: null,
  }));
}

export async function getAllEventsForCalendar(orgId: string) {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, name, type, date, start_time, venue_name, guest_count, status, total_price, contacts!inner(name)")
    .eq("org_id", orgId)
    .order("date", { ascending: true })
    .limit(60);

  return (events || []).map(e => ({
    id: e.id,
    name: e.name,
    type: e.type,
    date: e.date,
    start_time: e.start_time,
    venue_name: e.venue_name,
    guest_count: e.guest_count,
    status: e.status,
    total_price: e.total_price,
    contact: e.contacts?.[0] ? { name: e.contacts[0].name } : null,
  }));
}

export type DashboardAdditionalData = {
  pendingQuotes: number;
  signedContracts: number;
  lowStockItems: number;
  pendingContracts: number;
  staffCount: number;
  todayEvents: number;
  thisWeekEvents: number;
  totalContacts: number;
};

export async function getDashboardAdditionalData(orgId: string): Promise<DashboardAdditionalData> {
  const supabase = await createClient();
  const today = getDateRange(0);
  const weekEnd = getDateRange(-7);

  const [{ count: pendingQuotes }, { count: signedContracts },
    { count: pendingContracts }, { count: staffCount }, { count: todayEvents },
    { count: thisWeekEvents }, { count: totalContacts }, { data: inventoryItems }] = await Promise.all([
    supabase.from("quotes").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("status", "draft"),
    supabase.from("contracts").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("status", "signed"),
    supabase.from("contracts").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("status", "draft"),
    supabase.from("staff_assignments").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("org_id", orgId).gte("date", today).lte("date", today),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("org_id", orgId).gte("date", today).lte("date", weekEnd),
    supabase.from("contacts").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("inventory_items").select("quantity, reorder_level").eq("org_id", orgId).not("reorder_level", "is", null),
  ]);

  const lowStockItems = (inventoryItems || []).filter(
    (item: { quantity: number; reorder_level: number }) => item.quantity <= item.reorder_level
  ).length;

  return {
    pendingQuotes: pendingQuotes || 0,
    signedContracts: signedContracts || 0,
    lowStockItems,
    pendingContracts: pendingContracts || 0,
    staffCount: staffCount || 0,
    todayEvents: todayEvents || 0,
    thisWeekEvents: thisWeekEvents || 0,
    totalContacts: totalContacts || 0,
  };
}
