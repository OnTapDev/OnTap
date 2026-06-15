"use server";

import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getDashboardKPIs(orgId: string) {
  const supabase = createAdminClient();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];
  
  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(today.getDate() - 60);
  const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().split("T")[0];

  const { count: newLeads } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gte("created_at", thirtyDaysAgoStr);

  const { count: oldLeads } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gte("created_at", sixtyDaysAgoStr)
    .lt("created_at", thirtyDaysAgoStr);

  const { data: currentInvoices } = await supabase
    .from("invoices")
    .select("amount")
    .eq("org_id", orgId)
    .eq("status", "paid")
    .gte("created_at", thirtyDaysAgoStr);

  const { data: oldInvoices } = await supabase
    .from("invoices")
    .select("amount")
    .eq("org_id", orgId)
    .eq("status", "paid")
    .gte("created_at", sixtyDaysAgoStr)
    .lt("created_at", thirtyDaysAgoStr);

  const revenue = currentInvoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
  const prevRevenue = oldInvoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

  const { count: upcomingEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gte("date", todayStr)
    .lte("date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

  const oldTotalSignedContracts = await supabase
    .from("contracts")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("status", "signed")
    .gte("created_at", sixtyDaysAgoStr)
    .lt("created_at", thirtyDaysAgoStr);

  const newTotalSignedContracts = await supabase
    .from("contracts")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("status", "signed")
    .gte("created_at", thirtyDaysAgoStr);

  const oldTotalQuotes = await supabase
    .from("quotes")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gte("created_at", sixtyDaysAgoStr)
    .lt("created_at", thirtyDaysAgoStr);

  const newTotalQuotes = await supabase
    .from("quotes")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gte("created_at", thirtyDaysAgoStr);

  const prevConversion = oldTotalQuotes.count && oldTotalQuotes.count > 0 && oldTotalSignedContracts.count
    ? Math.round((oldTotalSignedContracts.count / oldTotalQuotes.count) * 100)
    : 0;
  
  const currentConversion = newTotalQuotes.count && newTotalQuotes.count > 0 && newTotalSignedContracts.count
    ? Math.round((newTotalSignedContracts.count / newTotalQuotes.count) * 100)
    : 0;

  const leadsChange = oldLeads && oldLeads > 0 && newLeads
    ? Math.round(((newLeads - oldLeads) / oldLeads) * 100)
    : newLeads ? 100 : 0;

  const revenueChange = prevRevenue > 0 && revenue
    ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100)
    : revenue > 0 ? 100 : 0;

  const conversionChange = prevConversion > 0 && currentConversion
    ? currentConversion - prevConversion
    : currentConversion > 0 ? 100 : 0;

  const generateChartData = async (type: "leads" | "revenue", periodDays: number = 30) => {
    const data: number[] = [];
    let cumulative = 0;
    
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      if (type === "leads") {
        const { count } = await supabase
          .from("contacts")
          .select("*", { count: "exact", head: true })
          .eq("org_id", orgId)
          .gte("created_at", dateStr)
          .lt("created_at", new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
        cumulative += count || 0;
        data.push(cumulative);
      } else {
        const { data: dayInvoices } = await supabase
          .from("invoices")
          .select("amount")
          .eq("org_id", orgId)
          .eq("status", "paid")
          .gte("created_at", dateStr)
          .lt("created_at", new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
        const dayRevenue = dayInvoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
        cumulative += dayRevenue;
        data.push(cumulative);
      }
    }
    return data;
  };

  const leadsChartData = await generateChartData("leads", 30);
  const revenueChartData = await generateChartData("revenue", 30);

  return {
    leads: {
      value: newLeads || 0,
      change: `${leadsChange >= 0 ? "+" : ""}${leadsChange}%`,
      chartData: leadsChartData,
    },
    revenue: {
      value: revenue,
      change: `${revenueChange >= 0 ? "+" : ""}${revenueChange}%`,
      chartData: revenueChartData,
    },
    events: {
      value: upcomingEvents || 0,
      change: "+3",
      chartData: Array.from({ length: 30 }, (_, i) => Math.max(0, (upcomingEvents || 0) - i)),
    },
    conversion: {
      value: currentConversion,
      change: `${conversionChange >= 0 ? "+" : ""}${conversionChange}%`,
      chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, currentConversion],
    },
  };
}

export async function getRecentLeads(orgId: string, limit = 5) {
  const supabase = createAdminClient();
  
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, email, phone, source, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return contacts || [];
}

export async function getUpcomingEventsList(orgId: string, limit = 5) {
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, email, phone, company, role, source, notes, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return contacts || [];
}

export async function getEventsForDashboard(orgId: string, limit = 10) {
  const supabase = createAdminClient();
  
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
  const supabase = createAdminClient();
  
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