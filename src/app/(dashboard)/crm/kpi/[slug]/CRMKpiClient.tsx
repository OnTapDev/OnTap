"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives";
import { DetailedLineChart } from "@/ui/components/MiniLineChart";
import { ChevronDown, ChevronUp, DollarSign, Target, Zap, Clock, Award, ArrowRight } from "lucide-react";
import Link from "next/link";

interface KPIData {
  value: number;
  change: string;
  chartData: number[];
}

interface PipelineKPIs {
  "pipeline-value": KPIData;
  "conversion-rate": KPIData;
  "sales-velocity": KPIData;
  "deal-age": KPIData;
  "win-rate": KPIData;
}

interface KPIConfig {
  title: string;
  icon: React.ElementType;
  description: string;
  format: "currency" | "percent" | "days";
  industryStandards: { metric: string; range: string; status: string }[];
  tips: string[];
  dataHref: string;
  dataLabel: string;
  getValue: (kpis: PipelineKPIs) => { value: string; change: string; chartData: number[] };
}

const kpiConfig: Record<string, KPIConfig> = {
  "pipeline-value": {
    title: "Pipeline Value",
    icon: DollarSign,
    description: "Total projected revenue of all open deals in your pipeline. This represents the total dollar value of all quotes currently in draft or sent status.",
    format: "currency",
    industryStandards: [
      { metric: "Pipeline Coverage Ratio", range: "3x quota", status: "Excellent" },
      { metric: "Avg Deal Size (Mobile Bar)", range: "$1,500-$5,000", status: "Good" },
    ],
    tips: ["Focus on moving high-value deals through the pipeline faster", "Regularly clean out stale deals to keep pipeline value accurate", "Track pipeline value trends month-over-month"],
    dataHref: "/billing",
    dataLabel: "View Quotes",
    getValue: (kpis) => ({ value: `$${kpis["pipeline-value"].value.toLocaleString()}`, change: kpis["pipeline-value"].change, chartData: kpis["pipeline-value"].chartData }),
  },
  "conversion-rate": {
    title: "Conversion Rate",
    icon: Target,
    description: "The percentage of prospects that move from quote to signed contract. Higher rates indicate effective sales processes and accurate quoting.",
    format: "percent",
    industryStandards: [{ metric: "Industry Avg (Service)", range: "20-35%", status: "Good" }],
    tips: ["Shorten response times to increase conversion", "Follow up within 24 hours of sending a quote", "Personalize quotes with client-specific details"],
    dataHref: "/contracts",
    dataLabel: "View Contracts",
    getValue: (kpis) => ({ value: `${kpis["conversion-rate"].value}%`, change: kpis["conversion-rate"].change, chartData: kpis["conversion-rate"].chartData }),
  },
  "sales-velocity": {
    title: "Sales Velocity",
    icon: Zap,
    description: "The average time it takes for a lead to move from first touchpoint to a closed deal. Faster velocity means your sales process is efficient.",
    format: "days",
    industryStandards: [{ metric: "Typical Sales Cycle (Events)", range: "14-45 days", status: "Good" }],
    tips: ["Qualify leads earlier to reduce time wasted on bad fits", "Use templates to speed up quoting", "Set clear follow-up cadences"],
    dataHref: "/crm?view=pipeline",
    dataLabel: "View Pipeline",
    getValue: (kpis) => ({ value: `${kpis["sales-velocity"].value} days`, change: kpis["sales-velocity"].change, chartData: kpis["sales-velocity"].chartData }),
  },
  "deal-age": {
    title: "Deal Age",
    icon: Clock,
    description: "The average amount of time open deals spend in your active pipeline. High deal age may indicate stalled opportunities.",
    format: "days",
    industryStandards: [{ metric: "Healthy Deal Age", range: "< 30 days", status: "Good" }],
    tips: ["Set up aging alerts for deals older than 30 days", "Create win-back sequences for stalled deals", "Review and archive dead deals monthly"],
    dataHref: "/crm?view=pipeline",
    dataLabel: "View Pipeline",
    getValue: (kpis) => ({ value: `${kpis["deal-age"].value} days`, change: kpis["deal-age"].change, chartData: kpis["deal-age"].chartData }),
  },
  "win-rate": {
    title: "Win Rate",
    icon: Award,
    description: "The percentage of total contacts created that successfully convert into signed contracts. This measures overall sales effectiveness.",
    format: "percent",
    industryStandards: [
      { metric: "Good Win Rate (Events)", range: "25-40%", status: "Good" },
      { metric: "Exceptional Win Rate", range: "50%+", status: "Excellent" },
    ],
    tips: ["Analyze why deals are lost and adjust your approach", "Focus on your best-performing lead sources", "Refine your ideal client profile"],
    dataHref: "/contracts",
    dataLabel: "View Contracts",
    getValue: (kpis) => ({ value: `${kpis["win-rate"].value}%`, change: kpis["win-rate"].change, chartData: kpis["win-rate"].chartData }),
  },
};

export function CRMKpiClient({ slug, kpis }: { slug: string; kpis: PipelineKPIs }) {
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
              {change && <div className="flex items-center gap-1 text-sm text-olive-gold mb-1"><ArrowRight className="w-4 h-4" /><span>{change}</span></div>}
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
        <CardHeader className="cursor-pointer hover:bg-warm-sand/5" onClick={() => toggleSection("standards")}>
          <div className="flex items-center justify-between"><CardTitle className="text-warm-white">Industry Standards</CardTitle>{openSections.standards ? <ChevronUp className="w-5 h-5 text-warm-sand" /> : <ChevronDown className="w-5 h-5 text-warm-sand" />}</div>
        </CardHeader>
        {openSections.standards && <CardContent><div className="space-y-2">{config.industryStandards.map((s, i) => <div key={i} className="flex items-center justify-between p-2 rounded bg-warm-sand/5"><span className="text-warm-sand text-sm">{s.metric}</span><span className="text-warm-white text-sm font-medium">{s.range} · <span className={s.status === "Excellent" ? "text-olive-gold" : "text-warm-sand"}>{s.status}</span></span></div>)}</div></CardContent>}
      </Card>

      <Card className="bg-charcoal border-warm-sand/20">
        <CardHeader className="cursor-pointer hover:bg-warm-sand/5" onClick={() => toggleSection("tips")}>
          <div className="flex items-center justify-between"><CardTitle className="text-warm-white">Tips</CardTitle>{openSections.tips ? <ChevronUp className="w-5 h-5 text-warm-sand" /> : <ChevronDown className="w-5 h-5 text-warm-sand" />}</div>
        </CardHeader>
        {openSections.tips && <CardContent><ul className="space-y-2">{config.tips.map((tip, i) => <li key={i} className="text-warm-sand">• {tip}</li>)}</ul></CardContent>}
      </Card>
    </div>
  );
}