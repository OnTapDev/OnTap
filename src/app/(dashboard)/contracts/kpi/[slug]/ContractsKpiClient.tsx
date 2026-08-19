"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives";
import { DetailedLineChart } from "@/ui/components/MiniLineChart";
import { ArrowUpRight, ChevronDown, ChevronUp, Clock, DollarSign, TrendingUp, FileCheck, ArrowRight } from "lucide-react";
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
    description: "Average days from inquiry to signed contract. Shorter cycles mean faster revenue and happier clients.",
    industryStandards: [
      { metric: "Lead-to-Contract", range: "5-14 days", status: "Good" },
      { metric: "Quote-to-Sign", range: "2-7 days", status: "Excellent" },
      { metric: "Follow-up Response", range: "< 24 hours", status: "Excellent" },
    ],
    tips: ["Respond to inquiries within 5 minutes", "Use templates to speed up contract creation", "Automate follow-up reminders", "Set clear expectations upfront"],
    dataHref: "/contracts", dataLabel: "View All Contracts",
    getValue: (k) => ({ value: k.avgCycleTime.value > 0 ? `${k.avgCycleTime.value} days` : "0 days", change: k.avgCycleTime.change, chartData: k.avgCycleTime.chartData }),
  },
  "alcohol-cogs": {
    title: "Alcohol COGS", icon: DollarSign,
    description: "Average alcohol cost of goods sold as a percentage of revenue. Lower percentages mean healthier margins.",
    industryStandards: [
      { metric: "Target Range", range: "15-25%", status: "Excellent" },
      { metric: "Pour Cost", range: "18-24%", status: "Good" },
      { metric: "Waste Allowance", range: "< 5%", status: "Excellent" },
    ],
    tips: ["Negotiate bulk pricing with suppliers", "Track pour costs per drink", "Optimize menu pricing based on cost", "Reduce waste with batch prep"],
    dataHref: "/contracts", dataLabel: "View All Contracts",
    getValue: (k) => ({ value: k.avgAlcoholCogs.value > 0 ? `${k.avgAlcoholCogs.value}%` : "0%", change: k.avgAlcoholCogs.change, chartData: k.avgAlcoholCogs.chartData }),
  },
  "revenue-per-hour": {
    title: "Revenue/Hour", icon: TrendingUp,
    description: "Average revenue generated per labor hour across all contracts. Higher values indicate better staffing efficiency.",
    industryStandards: [
      { metric: "Target", range: "$150-$250/hr", status: "Good" },
      { metric: "Premium Events", range: "$250-$400/hr", status: "Excellent" },
      { metric: "Minimum Viable", range: "$100-$150/hr", status: "Average" },
    ],
    tips: ["Optimize staffing per event size", "Bundle premium add-on services", "Review pricing quarterly", "Track peak hours for premium rates"],
    dataHref: "/contracts", dataLabel: "View All Contracts",
    getValue: (k) => ({ value: k.avgRevenuePerHour.value > 0 ? `$${k.avgRevenuePerHour.value}` : "$0", change: k.avgRevenuePerHour.change, chartData: k.avgRevenuePerHour.chartData }),
  },
  "signed-contracts": {
    title: "Signed Contracts", icon: FileCheck,
    description: "Total signed and completed contracts. Track momentum and forecast future revenue.",
    industryStandards: [
      { metric: "Monthly Target", range: "10-25", status: "Excellent" },
      { metric: "Conversion Rate", range: "20-30%", status: "Good" },
      { metric: "Repeat Clients", range: "40-60%", status: "Excellent" },
    ],
    tips: ["Send contracts within 24 hours of quote acceptance", "Offer early bird discounts for quick signatures", "Follow up within 48 hours of sending", "Track contract velocity by source"],
    dataHref: "/contracts", dataLabel: "View All Contracts",
    getValue: (k) => ({ value: k.totalSigned.value.toString(), change: k.totalSigned.change, chartData: k.totalSigned.chartData }),
  },
};

export function ContractsKpiClient({ slug, kpis }: { slug: string; kpis: ContractKPIData }) {
  const config = kpiConfig[slug];
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  if (!config) {
    return (
      <div className="space-y-6">
        <h1 className="text-warm-white">KPI Not Found</h1>
        <Link href="/contracts" className="text-warm-gold hover:text-warm-white">← Back to Contracts</Link>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const { value, change, chartData } = config.getValue(kpis);

  return (
    <div className="space-y-6">
      <Link href="/contracts" className="text-warm-gold hover:text-warm-white inline-flex items-center gap-1">← Back to Contracts</Link>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="bg-charcoal border-warm-sand/20 lg:w-1/2">
          <CardContent className="p-6">
            <div className="rounded-lg bg-warm-gold/20 p-3 mb-4 w-fit">
              <config.icon className="h-8 w-8 text-warm-gold" />
            </div>
            <p className="text-section-title text-warm-white mb-2">{config.title}</p>
            <div className="flex items-end gap-4">
              <p className="text-4xl font-bold text-warm-white">{value}</p>
              {change && (
                <div className="flex items-center gap-1 text-sm text-warm-gold mb-1">
                  <ArrowUpRight className="w-4 h-4" /><span>{change}</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-warm-sand/20">
              <Link href={config.dataHref} className="flex items-center gap-2 text-sm text-warm-gold hover:text-warm-white transition-colors">
                {config.dataLabel} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-warm-sand/20 lg:w-1/2">
          <CardContent className="p-6">
            <DetailedLineChart data={chartData} color="#7D6854" height={200} title="30-Day Trend" />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-charcoal border-warm-sand/20">
        <CardHeader><CardTitle className="text-warm-white">About This Metric</CardTitle></CardHeader>
        <CardContent><p className="text-warm-sand">{config.description}</p></CardContent>
      </Card>

      <Card className="bg-charcoal border-warm-sand/20">
        <CardHeader className="cursor-pointer hover:bg-warm-sand/5" onClick={() => toggleSection("industry")}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-warm-white">Industry Standards</CardTitle>
            {openSections.industry ? <ChevronUp className="w-5 h-5 text-warm-sand" /> : <ChevronDown className="w-5 h-5 text-warm-sand" />}
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
                          item.status === "Excellent" ? "bg-warm-gold/20 text-warm-gold" :
                          item.status === "Good" ? "bg-warm-sand/20 text-warm-sand" :
                          "bg-warm-sand/10 text-warm-sand"
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
        <CardHeader className="cursor-pointer hover:bg-warm-sand/5" onClick={() => toggleSection("tips")}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-warm-white">Best Practices & Tips</CardTitle>
            {openSections.tips ? <ChevronUp className="w-5 h-5 text-warm-sand" /> : <ChevronDown className="w-5 h-5 text-warm-sand" />}
          </div>
        </CardHeader>
        {openSections.tips && (
          <CardContent>
            <ul className="space-y-3">
              {config.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3 text-warm-sand">
                  <span className="text-warm-gold">•</span> {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
