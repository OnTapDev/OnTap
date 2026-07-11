"use server";

import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getCRMKPIs(orgId: string) {
  const supabase = createAdminClient();
  const today = new Date();
  
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];
  
  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(today.getDate() - 60);
  const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().split("T")[0];

  const { count: totalLeads } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId);

  const { count: newLeads } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gte("created_at", thirtyDaysAgoStr);

  const { count: _oldLeads } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gte("created_at", sixtyDaysAgoStr)
    .lt("created_at", thirtyDaysAgoStr);

  const { data: paidInvoices } = await supabase
    .from("invoices")
    .select("amount")
    .eq("org_id", orgId)
    .eq("status", "paid");

  const totalRevenue = paidInvoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

  const revenueChartData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    return Math.floor(totalRevenue * (i + 1) / 30);
  });

  const { data: activeQuoteData } = await supabase
    .from("quotes")
    .select("id, status")
    .eq("org_id", orgId)
    .in("status", ["draft", "sent"]);
  const activeQuotes = activeQuoteData?.length || 0;

  const activeQuotesChange = 5;

  const totalLeadsValue = totalLeads || 0;
  
  const generateChartData = async (type: "leads" | "quotes", periodDays: number = 30) => {
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
        const { count } = await supabase
          .from("quotes")
          .select("*", { count: "exact", head: true })
          .eq("org_id", orgId)
          .in("status", ["draft", "sent"])
          .gte("created_at", dateStr)
          .lt("created_at", new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
        cumulative += count || 0;
        data.push(cumulative);
      }
    }
    return data;
  };

  const leadsChartData = await generateChartData("leads", 30);
  const quotesChartData = await generateChartData("quotes", 30);

  const leadsChange = _oldLeads && _oldLeads > 0 && newLeads
    ? Math.round(((newLeads - _oldLeads) / _oldLeads) * 100)
    : newLeads ? 100 : 0;

  return {
    "total-leads": {
      value: totalLeadsValue,
      change: `${leadsChange >= 0 ? "+" : ""}${leadsChange}%`,
      chartData: leadsChartData,
    },
    "new-inquiries": {
      value: newLeads || 0,
      change: `${leadsChange >= 0 ? "+" : ""}${leadsChange}%`,
      chartData: leadsChartData,
    },
    "active-quotes": {
      value: activeQuotes || 0,
      change: `${activeQuotesChange >= 0 ? "+" : ""}${activeQuotesChange}%`,
      chartData: quotesChartData,
    },
    "revenue": {
      value: totalRevenue,
      change: "+0%",
      chartData: revenueChartData,
    },
  };
}

export async function getContractKPIs(orgId: string) {
  const supabase = createAdminClient();
  const today = new Date();
  
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  const { count: signedContracts } = await supabase
    .from("contracts")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("status", "signed");

  const { data: pendingContractData } = await supabase
    .from("contracts")
    .select("id, status")
    .eq("org_id", orgId)
    .in("status", ["draft", "sent", "viewed"]);
  const pendingContracts = pendingContractData?.length || 0;

  const { count: recentSigned } = await supabase
    .from("contracts")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("status", "signed")
    .gte("created_at", thirtyDaysAgoStr);

  const { data: revenueData } = await supabase
    .from("contracts")
    .select("total_value")
    .eq("org_id", orgId)
    .eq("status", "signed");

  const totalRevenue = revenueData?.reduce((sum, c) => sum + (c.total_value || 0), 0) || 0;
  const avgRevenuePerContract = signedContracts && signedContracts > 0 
    ? Math.round(totalRevenue / signedContracts) 
    : 0;

  return {
    "signed-contracts": {
      value: signedContracts || 0,
      change: "+12%",
      chartData: Array.from({ length: 30 }, (_, i) => Math.max(0, (signedContracts || 0) - i * 0.5)),
    },
    "pending-contracts": {
      value: pendingContracts || 0,
      change: "+3",
      chartData: Array.from({ length: 30 }, (_, i) => Math.max(0, (pendingContracts || 0) - i * 0.3)),
    },
    "avg-contract-value": {
      value: avgRevenuePerContract,
      change: "+8%",
      chartData: Array.from({ length: 30 }, (_, i) => Math.max(0, avgRevenuePerContract - i * 20)),
    },
    "recent-signed": {
      value: recentSigned || 0,
      change: "+5%",
      chartData: Array.from({ length: 30 }, (_, i) => Math.max(0, (recentSigned || 0) - i * 0.2)),
    },
  };
}

export async function getInvoiceKPIs(orgId: string) {
  const supabase = createAdminClient();
  const today = new Date();
  
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  const { count: paidInvoices } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("status", "paid");

  const { data: pendingInvoiceData } = await supabase
    .from("invoices")
    .select("id, status, due_date")
    .eq("org_id", orgId)
    .in("status", ["draft", "sent", "partial"]);
  const pendingInvoices = pendingInvoiceData?.length || 0;
  const overdueInvoices = pendingInvoiceData?.filter(i => i.due_date && new Date(i.due_date) < today).length || 0;

  const { data: paidData } = await supabase
    .from("invoices")
    .select("amount")
    .eq("org_id", orgId)
    .eq("status", "paid")
    .gte("created_at", thirtyDaysAgoStr);

  const totalPaid = paidData?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
  const avgInvoiceValue = paidInvoices && paidInvoices > 0 
    ? Math.round(totalPaid / paidInvoices) 
    : 0;

  return {
    "paid-invoices": {
      value: paidInvoices || 0,
      change: "+8%",
      chartData: Array.from({ length: 30 }, (_, i) => Math.max(0, (paidInvoices || 0) - i * 0.3)),
    },
    "pending-invoices": {
      value: pendingInvoices || 0,
      change: "+3",
      chartData: Array.from({ length: 30 }, (_, i) => Math.max(0, (pendingInvoices || 0) - i * 0.2)),
    },
    "avg-invoice-value": {
      value: avgInvoiceValue,
      change: "+5%",
      chartData: Array.from({ length: 30 }, (_, i) => Math.max(0, avgInvoiceValue - i * 10)),
    },
    "overdue-invoices": {
      value: overdueInvoices || 0,
      change: "-2",
      chartData: Array.from({ length: 30 }, (_, i) => Math.max(0, (overdueInvoices || 0) + i * 0.1)),
    },
  };
}