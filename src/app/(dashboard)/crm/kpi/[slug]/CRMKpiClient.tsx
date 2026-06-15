"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives";
import { DetailedLineChart } from "@/ui/components/MiniLineChart";
import { ArrowUpRight, ChevronDown, ChevronUp, Users, Target, FileText, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CRMKPIData {
  "total-leads": { value: number; change: string; chartData: number[] };
  "new-inquiries": { value: number; change: string; chartData: number[] };
  "active-quotes": { value: number; change: string; chartData: number[] };
  "revenue": { value: number; change: string; chartData: number[] };
}

interface KPIConfig {
  title: string;
  icon: React.ElementType;
  description: string;
  industryStandards: { metric: string; range: string; status: string }[];
  tips: string[];
  dataHref: string;
  dataLabel: string;
  getValue: (kpis: CRMKPIData) => { value: string; change: string; chartData: number[] };
}

const kpiConfig: Record<string, KPIConfig> = {
  "total-leads": {
    title: "Total Leads",
    icon: Users,
    description: "Total number of leads in your CRM pipeline.",
    industryStandards: [
      { metric: "Monthly Lead Generation", range: "30-100", status: "Excellent" },
      { metric: "Lead Source Diversity", range: "3+ channels", status: "Good" },
    ],
    tips: ["Diversify lead sources", "Respond within 5 minutes", "Use automated follow-up"],
    dataHref: "/crm?view=pipeline",
    dataLabel: "View Pipeline",
    getValue: (kpis) => ({ value: kpis["total-leads"].value.toString(), change: kpis["total-leads"].change, chartData: kpis["total-leads"].chartData }),
  },
  "new-inquiries": {
    title: "New Inquiries",
    icon: Target,
    description: "New inquiries representing fresh potential clients.",
    industryStandards: [{ metric: "Response Time", range: "< 5 min", status: "Good" }],
    tips: ["Set up instant notifications", "Create templates"],
    dataHref: "/crm?view=contacts",
    dataLabel: "View Contacts",
    getValue: (kpis) => ({ value: kpis["new-inquiries"].value.toString(), change: kpis["new-inquiries"].change, chartData: kpis["new-inquiries"].chartData }),
  },
  "active-quotes": {
    title: "Active Quotes",
    icon: FileText,
    description: "Quotes sent but not yet converted.",
    industryStandards: [{ metric: "Quote Follow-up", range: "Every 3 days", status: "Good" }],
    tips: ["Follow up within 48 hours", "Create urgency"],
    dataHref: "/billing",
    dataLabel: "View Quotes",
    getValue: (kpis) => ({ value: kpis["active-quotes"].value.toString(), change: kpis["active-quotes"].change, chartData: kpis["active-quotes"].chartData }),
  },
  "revenue": {
    title: "Revenue",
    icon: DollarSign,
    description: "Total paid revenue from invoices.",
    industryStandards: [
      { metric: "Monthly Revenue Growth", range: "10-30%", status: "Good" },
      { metric: "Avg Revenue Per Event", range: "$500-$5,000", status: "Excellent" },
    ],
    tips: ["Upsell premium packages", "Follow up on overdue invoices", "Offer early payment discounts"],
    dataHref: "/billing",
    dataLabel: "View Invoices",
    getValue: (kpis) => ({ value: `$${kpis.revenue.value.toLocaleString()}`, change: kpis.revenue.change, chartData: kpis.revenue.chartData }),
  },
};

export function CRMKpiClient({ slug, kpis }: { slug: string; kpis: CRMKPIData }) {
  const config = kpiConfig[slug];
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  if (!config) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-screen-title text-warm-white">KPI Not Found</h1>
          <p className="text-warm-sand mt-1">This KPI page does not exist.</p>
        </div>
        <Link href="/crm" className="text-olive-gold hover:text-warm-white">← Back</Link>
      </div>
    );
  }

  const toggleSection = (section: string) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  const { value, change, chartData } = config.getValue(kpis);

  return (
    <div className="space-y-6">
      <Link href="/crm" className="text-olive-gold hover:text-warm-white">← Back</Link>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="bg-charcoal border-warm-sand/20 lg:w-1/2">
          <CardContent className="p-6">
            <div className="rounded-lg bg-olive-gold/20 p-3 mb-4"><config.icon className="h-8 w-8 text-olive-gold" /></div>
            <p className="text-section-title text-warm-white mb-2">{config.title}</p>
            <div className="flex items-end gap-4">
              <p className="text-4xl font-bold text-warm-white">{value}</p>
              {change && <div className="flex items-center gap-1 text-sm text-olive-gold mb-1"><ArrowUpRight className="w-4 h-4" /><span>{change}</span></div>}
            </div>
            <div className="mt-4 pt-4 border-t border-warm-sand/20">
              <Link href={config.dataHref} className="flex items-center gap-2 text-sm text-olive-gold hover:text-warm-white">{config.dataLabel}<ArrowRight className="w-4 h-4" /></Link>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-warm-sand/20 lg:w-1/2">
          <CardContent className="p-6"><DetailedLineChart data={chartData} color="#7D7254" height={200} title="30-Day Trend" /></CardContent>
        </Card>
      </div>

      <Card className="bg-charcoal border-warm-sand/20"><CardHeader><CardTitle className="text-warm-white">About</CardTitle></CardHeader><CardContent><p className="text-warm-sand">{config.description}</p></CardContent></Card>

      <Card className="bg-charcoal border-warm-sand/20">
        <CardHeader className="cursor-pointer hover:bg-warm-sand/5" onClick={() => toggleSection("tips")}>
          <div className="flex items-center justify-between"><CardTitle className="text-warm-white">Tips</CardTitle>{openSections.tips ? <ChevronUp className="w-5 h-5 text-warm-sand" /> : <ChevronDown className="w-5 h-5 text-warm-sand" />}</div>
        </CardHeader>
        {openSections.tips && <CardContent><ul className="space-y-2">{config.tips.map((tip, i) => <li key={i} className="text-warm-sand">• {tip}</li>)}</ul></CardContent>}
      </Card>
    </div>
  );
}