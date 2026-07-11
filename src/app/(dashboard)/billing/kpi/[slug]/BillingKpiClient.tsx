"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives";
import { DetailedLineChart } from "@/ui/components/MiniLineChart";
import { ArrowUpRight, ChevronDown, ChevronUp, DollarSign, Receipt, TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

type KpiData = { value: number; change: string; chartData: number[] };

interface KpiConfigItem {
  title: string;
  icon: React.ElementType;
  description: string;
  industryStandards: { metric: string; range: string; status: string }[];
  tips: string[];
  dataHref: string;
  dataLabel: string;
  format: (v: number) => string;
}

const kpiConfig: Record<string, KpiConfigItem> = {
  "total-outstanding": {
    title: "Total Outstanding", icon: DollarSign,
    description: "Total unpaid balance across all invoices. Track your accounts receivable to maintain healthy cash flow.",
    industryStandards: [
      { metric: "AR to Revenue", range: "< 15%", status: "Excellent" },
      { metric: "Days Outstanding", range: "< 30 days", status: "Good" },
      { metric: "Collection Rate", range: "> 90%", status: "Excellent" },
    ],
    tips: ["Send payment reminders 3 days before due date", "Offer early payment discounts (2/10 Net 30)", "Set up automated follow-up sequences", "Require deposits for new clients"],
    dataHref: "/billing", dataLabel: "View All Invoices",
    format: (v) => `$${v.toLocaleString()}`,
  },
  "total-paid": {
    title: "Total Paid", icon: Receipt,
    description: "Total revenue collected from paid invoices. This represents your confirmed cash inflow.",
    industryStandards: [
      { metric: "Payment Rate", range: "> 85%", status: "Excellent" },
      { metric: "Avg Days to Pay", range: "< 14 days", status: "Good" },
      { metric: "Repeat Payers", range: "> 50%", status: "Excellent" },
    ],
    tips: ["Send invoices immediately after service", "Offer multiple payment methods", "Follow up on overdue accounts weekly", "Track payment trends by client type"],
    dataHref: "/billing", dataLabel: "View All Invoices",
    format: (v) => `$${v.toLocaleString()}`,
  },
  "total-quoted": {
    title: "Total Quoted", icon: TrendingUp,
    description: "Total value of active quotes in your pipeline. This represents potential future revenue.",
    industryStandards: [
      { metric: "Quote-to-Close", range: "20-30%", status: "Good" },
      { metric: "Avg Quote Value", range: "$2,000-$5,000", status: "Good" },
      { metric: "Response Time", range: "< 24 hours", status: "Excellent" },
    ],
    tips: ["Follow up within 24 hours of sending a quote", "Bundle services to increase quote value", "Track which package types convert best", "Set expiration dates to create urgency"],
    dataHref: "/billing", dataLabel: "View All Quotes",
    format: (v) => `$${v.toLocaleString()}`,
  },
  "overdue-count": {
    title: "Overdue Invoices", icon: AlertCircle,
    description: "Invoices past their due date. Minimizing overdue invoices is critical for cash flow health.",
    industryStandards: [
      { metric: "Overdue Rate", range: "< 5%", status: "Excellent" },
      { metric: "Resolution Time", range: "< 7 days", status: "Good" },
      { metric: "Bad Debt", range: "< 2%", status: "Excellent" },
    ],
    tips: ["Send overdue notices immediately", "Offer payment plan options", "Pause services for accounts > 60 days overdue", "Review credit terms for repeat offenders"],
    dataHref: "/billing", dataLabel: "View Overdue Invoices",
    format: (v) => `${v} invoices`,
  },
};

export function BillingKpiClient({ slug, kpis }: { slug: string; kpis: Record<string, KpiData> }) {
  const config = kpiConfig[slug];
  const data = kpis[slug];
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  if (!config || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-warm-white">KPI Not Found</h1>
        <Link href="/billing" className="text-olive-gold hover:text-warm-white">← Back to Billing</Link>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const { value, change, chartData } = data;
  const displayValue = config.format(value);

  return (
    <div className="space-y-6">
      <Link href="/billing" className="text-olive-gold hover:text-warm-white inline-flex items-center gap-1">← Back to Billing</Link>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="bg-charcoal border-warm-sand/20 lg:w-1/2">
          <CardContent className="p-6">
            <div className="rounded-lg bg-olive-gold/20 p-3 mb-4 w-fit">
              <config.icon className="h-8 w-8 text-olive-gold" />
            </div>
            <p className="text-section-title text-warm-white mb-2">{config.title}</p>
            <div className="flex items-end gap-4">
              <p className="text-4xl font-bold text-warm-white">{displayValue}</p>
              {change && value > 0 && (
                <div className="flex items-center gap-1 text-sm text-olive-gold mb-1">
                  <ArrowUpRight className="w-4 h-4" /><span>{change}</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-warm-sand/20">
              <Link href={config.dataHref} className="flex items-center gap-2 text-sm text-olive-gold hover:text-warm-white transition-colors">
                {config.dataLabel} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-warm-sand/20 lg:w-1/2">
          <CardContent className="p-6">
            <DetailedLineChart data={chartData.length > 0 ? chartData : [0]} color="#7D7254" height={200} title="30-Day Trend" />
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
                          item.status === "Excellent" ? "bg-olive-gold/20 text-olive-gold" :
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
                  <span className="text-olive-gold">•</span> {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
