"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";

export async function getContracts(orgId: string) {
  const supabase = await createClient();
  
  const { data: contracts, error } = await supabase
    .from("contracts")
    .select(`
      *,
      event:events(name, date, venue_name),
      contact:contacts(name, email)
    `)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contracts:", error);
    return [];
  }

  return contracts || [];
}

export async function getContractTemplates(orgId: string) {
  const supabase = await createClient();
  
  const { data: templates, error } = await supabase
    .from("contract_templates")
    .select("*")
    .eq("org_id", orgId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching templates:", error);
    return [];
  }

  return templates || [];
}

export async function createContract(orgId: string, contract: {
  event_id: string;
  contact_id: string;
  template_id?: string;
  title: string;
  content?: string;
  total_amount?: number;
  status?: string;
  contract_type?: string;
  scope?: string;
  rain_clause?: boolean;
  liquor_liability?: boolean;
  payment_schedule?: string;
  inquiry_date?: string;
  setup_hours?: number;
  service_hours?: number;
  teardown_hours?: number;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("contracts")
    .insert({
      org_id: orgId,
      ...contract,
      status: contract.status || "draft",
      total_labor_hours: (contract.setup_hours || 0) + (contract.service_hours || 0) + (contract.teardown_hours || 0),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating contract:", error);
    throw new Error(error.message);
  }

  revalidatePath("/contracts");
  revalidatePath("/crm");
  return data;
}

export async function updateContract(id: string, data: {
  status?: string;
  signed_at?: string;
  content?: string;
  total_amount?: number;
  contract_type?: string;
  scope?: string;
  rain_clause?: boolean;
  liquor_liability?: boolean;
  payment_schedule?: string;
  venue_access_rights?: string;
  venue_power_water?: string;
  non_solicitation?: boolean;
  uniform_conduct?: string;
  inquiry_date?: string;
  first_sent_date?: string;
  alcohol_cogs_percentage?: number;
  setup_hours?: number;
  service_hours?: number;
  teardown_hours?: number;
}) {
  const supabase = await createClient();
  
  const updateData: Record<string, unknown> = { ...data };
  
  if (data.total_amount && (data.setup_hours || data.service_hours || data.teardown_hours)) {
    const setup = data.setup_hours || 0;
    const service = data.service_hours || 0;
    const teardown = data.teardown_hours || 0;
    const totalHours = setup + service + teardown;
    if (totalHours > 0) {
      updateData.revenue_per_hour = data.total_amount / totalHours;
    }
    updateData.total_labor_hours = totalHours;
  }

  const { data: contract, error } = await supabase
    .from("contracts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating contract:", error);
    throw new Error(error.message);
  }

  revalidatePath("/contracts");
  revalidatePath("/crm");
  return contract;
}

export async function createContractTemplate(orgId: string, template: {
  name: string;
  content: string;
  description?: string;
  contract_type?: string;
  has_rain_clause?: boolean;
  has_liquor_liability?: boolean;
  has_non_solicitation?: boolean;
  default_payment_schedule?: string;
  default_scope?: string;
  venue_access_rights?: string;
  venue_power_water?: string;
  uniform_conduct?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("contract_templates")
    .insert({
      org_id: orgId,
      ...template,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating template:", error);
    throw new Error(error.message);
  }

  revalidatePath("/contracts");
  return data;
}

export async function deleteContract(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("contracts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting contract:", error);
    throw new Error(error.message);
  }

  revalidatePath("/contracts");
  return { success: true };
}

export async function getContractKPIs(orgId: string) {
  const supabase = await createClient();
  const today = new Date();
  
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];
  
  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(today.getDate() - 60);
  const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().split("T")[0];

  const { data: allContracts, error } = await supabase
    .from("contracts")
    .select(`
      *,
      event:events(date, created_at)
    `)
    .eq("org_id", orgId)
    .in("status", ["signed", "completed"]);

  if (error || !allContracts) {
    return { 
      avgCycleTime: { value: 0, change: "+0%", chartData: [] },
      avgAlcoholCogs: { value: 0, change: "+0%", chartData: [] },
      avgRevenuePerHour: { value: 0, change: "+0%", chartData: [] },
      totalSigned: { value: 0, change: "+0%", chartData: [] }
    };
  }

  const currentContracts = allContracts.filter(c => new Date(c.created_at) >= new Date(thirtyDaysAgoStr));
  const oldContracts = allContracts.filter(c => {
    const created = new Date(c.created_at);
    return created >= new Date(sixtyDaysAgoStr) && created < new Date(thirtyDaysAgoStr);
  });

  let totalCycleTime = 0, totalAlcoholCogs = 0, totalRevenuePerHour = 0, count = 0;
  for (const contract of allContracts) {
    const inquiryDate = contract.inquiry_date || contract.event?.created_at || contract.created_at;
    const signedDate = contract.signed_at;
    if (inquiryDate && signedDate) {
      totalCycleTime += (new Date(signedDate).getTime() - new Date(inquiryDate).getTime()) / (1000 * 60 * 60 * 24);
      count++;
    }
    if (contract.alcohol_cogs_percentage) totalAlcoholCogs += contract.alcohol_cogs_percentage;
    if (contract.revenue_per_hour) totalRevenuePerHour += contract.revenue_per_hour;
  }

  const avgCycleTime = count > 0 ? Math.round(totalCycleTime / count * 10) / 10 : 0;
  const avgAlcoholCogs = count > 0 ? Math.round((totalAlcoholCogs / count) * 10) / 10 : 0;
  const avgRevenuePerHour = count > 0 ? Math.round(totalRevenuePerHour / count * 10) / 10 : 0;
  const totalSigned = allContracts.length;

  const signedChange = oldContracts.length > 0 && currentContracts.length > 0
    ? Math.round(((currentContracts.length - oldContracts.length) / oldContracts.length) * 100)
    : currentContracts.length > 0 ? 100 : 0;

  // Generate chart data by day for the last 30 days
  const cycleTimeByDay: number[] = [];
  const cogsByDay: number[] = [];
  const revenueByDay: number[] = [];
  const signedByDay: number[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const nextDateStr = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const dayContracts = allContracts.filter(c => {
      const created = new Date(c.created_at);
      return created >= new Date(dateStr) && created < new Date(nextDateStr);
    });

    // Cycle time - average for contracts signed that day
    let dayCycleTime = 0, dayCogs = 0, dayRevenue = 0, dayCount = 0;
    for (const c of dayContracts) {
      const inquiryDate = c.inquiry_date || c.event?.created_at || c.created_at;
      const signedDate = c.signed_at;
      if (inquiryDate && signedDate) {
        dayCycleTime += (new Date(signedDate).getTime() - new Date(inquiryDate).getTime()) / (1000 * 60 * 60 * 24);
        dayCount++;
      }
      if (c.alcohol_cogs_percentage) dayCogs += c.alcohol_cogs_percentage;
      if (c.revenue_per_hour) dayRevenue += c.revenue_per_hour;
    }

    cycleTimeByDay.push(dayCount > 0 ? Math.round(dayCycleTime / dayCount * 10) / 10 : 0);
    cogsByDay.push(dayCount > 0 ? Math.round((dayCogs / dayCount) * 10) / 10 : 0);
    revenueByDay.push(dayCount > 0 ? Math.round(dayRevenue / dayCount * 10) / 10 : 0);
    signedByDay.push(dayContracts.length);
  }

  // Calculate changes
  const prevCycleTime = cycleTimeByDay.slice(0, 15).filter(v => v > 0).reduce((a, b) => a + b, 0) / (cycleTimeByDay.slice(0, 15).filter(v => v > 0).length || 1);
  const currCycleTime = cycleTimeByDay.slice(15).filter(v => v > 0).reduce((a, b) => a + b, 0) / (cycleTimeByDay.slice(15).filter(v => v > 0).length || 1);
  const cycleTimeChange = prevCycleTime > 0 && currCycleTime > 0 ? Math.round(((currCycleTime - prevCycleTime) / prevCycleTime) * 100) : 0;

  return {
    avgCycleTime: { value: avgCycleTime, change: `${cycleTimeChange >= 0 ? "+" : ""}${cycleTimeChange}%`, chartData: cycleTimeByDay },
    avgAlcoholCogs: { value: avgAlcoholCogs, change: avgAlcoholCogs > 0 ? "-2%" : "+0%", chartData: cogsByDay },
    avgRevenuePerHour: { value: avgRevenuePerHour, change: avgRevenuePerHour > 0 ? "+15%" : "+0%", chartData: revenueByDay },
    totalSigned: { value: totalSigned, change: `${signedChange >= 0 ? "+" : ""}${signedChange}%`, chartData: signedByDay },
  };
}
