"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives";
import { DetailedLineChart } from "@/ui/components/MiniLineChart";
import { ArrowUpRight, ChevronDown, ChevronUp, Users, DollarSign, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface KPIData {
  leads: { value: number; change: string; chartData: number[] };
  revenue: { value: number; change: string; chartData: number[] };
  events: { value: number; change: string; chartData: number[] };
  conversion: { value: number; change: string; chartData: number[] };
}

interface KPIConfig {
  title: string;
  icon: React.ElementType;
  description: string;
  industryStandards: { metric: string; range: string; status: string }[];
  tips: string[];
  dataHref: string;
  dataLabel: string;
  getValue: (kpis: KPIData) => { value: string; change: string; chartData: number[] };
}

const kpiConfig: Record<string, KPIConfig> = {
  leads: {
    title: "Active Leads",
    icon: Users,
    description: "New leads generated in the last 30 days. Track growth over time to understand your pipeline health.",
    industryStandards: [
      { metric: "Lead Response Time", range: "< 5 minutes", status: "Excellent" },
      { metric: "Lead-to-Customer Rate", range: "15-25%", status: "Average" },
      { metric: "Contacts per Month", range: "50-200", status: "Good" },
      { metric: "Contact Retention", range: "60%+", status: "Excellent" },
    ],
    tips: [
      "Follow up with new leads within 5 minutes for best conversion",
      "Segment contacts by source to track which channels bring quality leads",
      "Regular cleanup of stale contacts improves CRM accuracy",
      "Use tags to categorize contacts by event type for targeted marketing",
    ],
    dataHref: "/crm?view=contacts",
    dataLabel: "View All Contacts",
    getValue: (kpis) => ({ value: kpis.leads.value.toString(), change: kpis.leads.change, chartData: kpis.leads.chartData }),
  },
  revenue: {
    title: "Revenue This Month",
    icon: DollarSign,
    description: "Total revenue collected this month from all completed events and invoices.",
    industryStandards: [
      { metric: "Revenue per Event", range: "$2,000-$10,000", status: "Good" },
      { metric: "Revenue per Bartender/hr", range: "$75-$150", status: "Average" },
      { metric: "Monthly Growth Rate", range: "5-15%", status: "Excellent" },
      { metric: "Repeat Client Rate", range: "40-60%", status: "Good" },
    ],
    tips: [
      "Upsell additional services like cocktail garnishments and specialty drinks",
      "Offer package deals for multi-day events",
      "Encourage referrals with incentive programs",
      "Track which event types generate highest revenue",
    ],
    dataHref: "/invoices",
    dataLabel: "View All Invoices",
    getValue: (kpis) => ({ value: `$${kpis.revenue.value.toLocaleString()}`, change: kpis.revenue.change, chartData: kpis.revenue.chartData }),
  },
  events: {
    title: "Upcoming Events",
    icon: Calendar,
    description: "Total confirmed and tentative events scheduled in the coming weeks.",
    industryStandards: [
      { metric: "Booking Lead Time", range: "30-60 days", status: "Good" },
      { metric: "Event Fill Rate", range: "75-90%", status: "Excellent" },
      { metric: "Average Event Size", range: "75-150 guests", status: "Average" },
      { metric: "Cancellation Rate", range: "< 10%", status: "Good" },
    ],
    tips: [
      "Buffer 10-15% of slots for last-minute bookings",
      "Send reminder emails 1 week before events",
      "Require deposits to reduce no-shows",
      "Track peak booking months for staffing optimization",
    ],
    dataHref: "/events",
    dataLabel: "View All Events",
    getValue: (kpis) => ({ value: kpis.events.value.toString(), change: kpis.events.change, chartData: kpis.events.chartData }),
  },
  conversion: {
    title: "Conversion Rate",
    icon: TrendingUp,
    description: "Percentage of leads that convert to booked events. This is a key indicator of sales effectiveness.",
    industryStandards: [
      { metric: "Lead-to-Quote Rate", range: "40-60%", status: "Good" },
      { metric: "Quote-to-Booking Rate", range: "25-35%", status: "Excellent" },
      { metric: "Overall Conversion", range: "20-30%", status: "Excellent" },
      { metric: "Average Sales Cycle", range: "21-45 days", status: "Good" },
    ],
    tips: [
      "Follow up on quotes within 48 hours",
      "Create urgency with limited availability",
      "Include social proof in proposals",
      "Offer flexible payment plans for larger bookings",
    ],
    dataHref: "/quotes",
    dataLabel: "View All Quotes",
    getValue: (kpis) => ({ value: `${kpis.conversion.value}%`, change: kpis.conversion.change, chartData: kpis.conversion.chartData }),
  },
};

export function DashboardKpiClient({ slug, kpis }: { slug: string; kpis: KPIData }) {
  const config = kpiConfig[slug];
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  if (!config) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-screen-title text-warm-white">KPI Not Found</h1>
          <p className="text-warm-sand mt-1">This KPI page does not exist.</p>
        </div>
        <Link href="/dashboard" className="text-olive-gold hover:text-warm-white">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const { value, change, chartData } = config.getValue(kpis);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-olive-gold hover:text-warm-white">
          ← Back
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="bg-charcoal border-warm-sand/20 lg:w-1/2">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="rounded-lg bg-olive-gold/20 p-3">
                <config.icon className="h-8 w-8 text-olive-gold" />
              </div>
            </div>
            <p className="text-section-title text-warm-white mb-2">{config.title}</p>
            <div className="flex items-end gap-4">
              <p className="text-4xl font-bold text-warm-white">{value}</p>
              {change && (
                <div className="flex items-center gap-1 text-sm text-olive-gold mb-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{change}</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-warm-sand/20">
              <Link 
                href={config.dataHref}
                className="flex items-center gap-2 text-sm text-olive-gold hover:text-warm-white transition-colors"
              >
                {config.dataLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-charcoal border-warm-sand/20 lg:w-1/2">
          <CardContent className="p-6">
            <DetailedLineChart data={chartData} color="#7D7254" height={200} title="30-Day Trend" />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-charcoal border-warm-sand/20">
        <CardHeader>
          <CardTitle className="text-warm-white">About This Metric</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-warm-sand">{config.description}</p>
        </CardContent>
      </Card>

      <Card className="bg-charcoal border-warm-sand/20">
        <CardHeader 
          className="cursor-pointer hover:bg-warm-sand/5" 
          onClick={() => toggleSection("industry")}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-warm-white">Industry Standards</CardTitle>
            {openSections.industry ? (
              <ChevronUp className="w-5 h-5 text-warm-sand" />
            ) : (
              <ChevronDown className="w-5 h-5 text-warm-sand" />
            )}
          </div>
        </CardHeader>
        {openSections.industry && (
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-warm-sand/20">
                    <th className="text-left py-3 px-4 text-warm-sand font-medium">Metric</th>
                    <th className="text-left py-3 px-4 text-warm-sand font-medium">Industry Standard</th>
                    <th className="text-left py-3 px-4 text-warm-sand font-medium">Your Status</th>
                  </tr>
                </thead>
                <tbody>
                  {config.industryStandards.map((item, index) => (
                    <tr key={index} className="border-b border-warm-sand/10">
                      <td className="py-3 px-4 text-warm-white">{item.metric}</td>
                      <td className="py-3 px-4 text-warm-sand">{item.range}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === "Excellent" ? "bg-green-500/20 text-green-400" :
                          item.status === "Good" ? "bg-olive-gold/20 text-olive-gold" :
                          "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="bg-charcoal border-warm-sand/20">
        <CardHeader 
          className="cursor-pointer hover:bg-warm-sand/5" 
          onClick={() => toggleSection("tips")}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-warm-white">Best Practices & Tips</CardTitle>
            {openSections.tips ? (
              <ChevronUp className="w-5 h-5 text-warm-sand" />
            ) : (
              <ChevronDown className="w-5 h-5 text-warm-sand" />
            )}
          </div>
        </CardHeader>
        {openSections.tips && (
          <CardContent>
            <ul className="space-y-3">
              {config.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3 text-warm-sand">
                  <span className="text-olive-gold">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
    </div>
  );
}