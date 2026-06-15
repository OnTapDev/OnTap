"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives";
import { DetailedLineChart } from "@/ui/components/MiniLineChart";
import { ArrowUpRight, Clock, DollarSign, TrendingUp, FileCheck } from "lucide-react";
import Link from "next/link";

interface ContractKPIData {
  avgCycleTime: { value: number; change: string; chartData: number[] };
  avgAlcoholCogs: { value: number; change: string; chartData: number[] };
  avgRevenuePerHour: { value: number; change: string; chartData: number[] };
  totalSigned: { value: number; change: string; chartData: number[] };
}

interface KPIConfig {
  title: string;
  icon: React.ElementType;
  description: string;
  industryStandards: { metric: string; range: string; status: string }[];
  tips: string[];
  dataHref: string;
  dataLabel: string;
  getValue: (kpis: ContractKPIData) => { value: string; change: string; chartData: number[] };
}

const kpiConfig: Record<string, KPIConfig> = {
  "avg-cycle-time": {
    title: "Avg Cycle Time", icon: Clock,
    description: "Average days from inquiry to signed contract.",
    industryStandards: [{ metric: "Industry Avg", range: "5-14 days", status: "Good" }],
    tips: ["Respond to inquiries quickly", "Automate follow-ups", "Streamline contract creation"],
    dataHref: "/contracts", dataLabel: "View Contracts",
    getValue: (k) => ({ value: k.avgCycleTime.value > 0 ? `${k.avgCycleTime.value} days` : "0 days", change: k.avgCycleTime.change, chartData: k.avgCycleTime.chartData }),
  },
  "alcohol-cogs": {
    title: "Alcohol COGS", icon: DollarSign,
    description: "Average alcohol cost of goods sold as a percentage.",
    industryStandards: [{ metric: "Target Range", range: "15-25%", status: "Excellent" }],
    tips: ["Negotiate with suppliers", "Track pour costs", "Optimize menu pricing"],
    dataHref: "/contracts", dataLabel: "View Contracts",
    getValue: (k) => ({ value: k.avgAlcoholCogs.value > 0 ? `${k.avgAlcoholCogs.value}%` : "0%", change: k.avgAlcoholCogs.change, chartData: k.avgAlcoholCogs.chartData }),
  },
  "revenue-per-hour": {
    title: "Revenue/Hour", icon: TrendingUp,
    description: "Average revenue per labor hour across contracts.",
    industryStandards: [{ metric: "Target", range: "$150-$250/hr", status: "Good" }],
    tips: ["Optimize staffing per event", "Bundle premium services", "Review pricing regularly"],
    dataHref: "/contracts", dataLabel: "View Contracts",
    getValue: (k) => ({ value: k.avgRevenuePerHour.value > 0 ? `$${k.avgRevenuePerHour.value}` : "$0", change: k.avgRevenuePerHour.change, chartData: k.avgRevenuePerHour.chartData }),
  },
  "signed-contracts": {
    title: "Signed Contracts", icon: FileCheck,
    description: "Total signed and completed contracts.",
    industryStandards: [{ metric: "Monthly Target", range: "10-25", status: "Excellent" }],
    tips: ["Send contracts immediately after quoting", "Offer early bird discounts", "Follow up within 48 hours"],
    dataHref: "/contracts", dataLabel: "View Contracts",
    getValue: (k) => ({ value: k.totalSigned.value.toString(), change: k.totalSigned.change, chartData: k.totalSigned.chartData }),
  },
};

export function ContractsKpiClient({ slug, kpis }: { slug: string; kpis: ContractKPIData }) {
  const config = kpiConfig[slug];
  if (!config) return <div><h1>KPI Not Found</h1><Link href="/contracts">← Back</Link></div>;
  const { value, change, chartData } = config.getValue(kpis);

  return (
    <div className="space-y-6">
      <Link href="/contracts" className="text-olive-gold">← Back</Link>
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="bg-charcoal border-warm-sand/20 lg:w-1/2"><CardContent className="p-6"><div className="rounded-lg bg-olive-gold/20 p-3 mb-4"><config.icon className="h-8 w-8 text-olive-gold" /></div><p className="text-4xl font-bold text-warm-white">{value}</p>{change && <div className="flex items-center gap-1 text-olive-gold"><ArrowUpRight className="w-4 h-4" /><span>{change}</span></div>}<Link href={config.dataHref} className="text-olive-gold mt-4 block">{config.dataLabel}</Link></CardContent></Card>
        <Card className="bg-charcoal border-warm-sand/20 lg:w-1/2"><CardContent className="p-6"><DetailedLineChart data={chartData} color="#7D7254" height={200} title="Trend" /></CardContent></Card>
      </div>
      <Card className="bg-charcoal border-warm-sand/20"><CardHeader><CardTitle>{config.description}</CardTitle></CardHeader></Card>
    </div>
  );
}