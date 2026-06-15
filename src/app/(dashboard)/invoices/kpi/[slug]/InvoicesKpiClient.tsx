"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives";
import { DetailedLineChart } from "@/ui/components/MiniLineChart";
import { ArrowUpRight, FileText, Check, Clock } from "lucide-react";
import Link from "next/link";

interface InvoiceKPIData {
  "paid-invoices": { value: number; change: string; chartData: number[] };
  "pending-invoices": { value: number; change: string; chartData: number[] };
  "avg-invoice-value": { value: number; change: string; chartData: number[] };
  "overdue-invoices": { value: number; change: string; chartData: number[] };
}

interface KPIConfig {
  title: string;
  icon: React.ElementType;
  description: string;
  tips: string[];
  dataHref: string;
  dataLabel: string;
  getValue: (kpis: InvoiceKPIData) => { value: string; change: string; chartData: number[] };
}

const kpiConfig: Record<string, KPIConfig> = {
  "paid-invoices": {
    title: "Paid Invoices", icon: Check,
    description: "Total invoices marked as paid.",
    tips: ["Require 50% deposit", "Offer multiple payment methods"],
    dataHref: "/invoices?status=paid", dataLabel: "View Paid",
    getValue: (k) => ({ value: k["paid-invoices"].value.toString(), change: k["paid-invoices"].change, chartData: k["paid-invoices"].chartData }),
  },
  "pending-invoices": {
    title: "Pending Invoices", icon: FileText,
    description: "Invoices awaiting payment.",
    tips: ["Send reminders", "Offer payment plans"],
    dataHref: "/invoices?status=pending", dataLabel: "View Pending",
    getValue: (k) => ({ value: k["pending-invoices"].value.toString(), change: k["pending-invoices"].change, chartData: k["pending-invoices"].chartData }),
  },
  "avg-invoice-value": {
    title: "Avg Invoice Value", icon: ArrowUpRight,
    description: "Average revenue per paid invoice.",
    tips: ["Bundle services", "Upsell add-ons"],
    dataHref: "/invoices", dataLabel: "View Invoices",
    getValue: (k) => ({ value: `$${k["avg-invoice-value"].value}`, change: k["avg-invoice-value"].change, chartData: k["avg-invoice-value"].chartData }),
  },
  "overdue-invoices": {
    title: "Overdue Invoices", icon: Clock,
    description: "Invoices past their due date.",
    tips: ["Call overdue clients", "Set up automatic reminders"],
    dataHref: "/invoices?status=pending", dataLabel: "View Pending",
    getValue: (k) => ({ value: k["overdue-invoices"].value.toString(), change: k["overdue-invoices"].change, chartData: k["overdue-invoices"].chartData }),
  },
};

export function InvoicesKpiClient({ slug, kpis }: { slug: string; kpis: InvoiceKPIData }) {
  const config = kpiConfig[slug];
  if (!config) return <div><h1>KPI Not Found</h1><Link href="/invoices">← Back</Link></div>;
  const { value, change, chartData } = config.getValue(kpis);

  return (
    <div className="space-y-6">
      <Link href="/invoices" className="text-olive-gold">← Back</Link>
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="bg-charcoal border-warm-sand/20 lg:w-1/2"><CardContent className="p-6"><div className="rounded-lg bg-olive-gold/20 p-3 mb-4"><config.icon className="h-8 w-8 text-olive-gold" /></div><p className="text-4xl font-bold text-warm-white">{value}</p>{change && <div className="flex items-center gap-1 text-olive-gold"><ArrowUpRight className="w-4 h-4" /><span>{change}</span></div>}<Link href={config.dataHref} className="text-olive-gold mt-4 block">{config.dataLabel}</Link></CardContent></Card>
        <Card className="bg-charcoal border-warm-sand/20 lg:w-1/2"><CardContent className="p-6"><DetailedLineChart data={chartData} color="#7D7254" height={200} title="Trend" /></CardContent></Card>
      </div>
      <Card className="bg-charcoal border-warm-sand/20"><CardHeader><CardTitle>{config.description}</CardTitle></CardHeader></Card>
    </div>
  );
}