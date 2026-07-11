"use client";

import { useState } from "react";
import { Card, CardContent, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives";
import { MiniLineChart } from "@/ui/components/MiniLineChart";
import {
  FileText, Plus, Eye, CheckCircle, XCircle, Send, ArrowUpRight, Clock, DollarSign, TrendingUp, FileCheck,

} from "lucide-react";
import Link from "next/link";
import { createContract, updateContract } from "@/modules/contracts/actions/contracts";

type Contract = {
  id: string;
  title: string;
  status: string;
  total_amount: number | null;
  created_at: string;
  signed_at: string | null;
  event: { name: string; date: string } | null;
  contact: { name: string; email: string } | null;
};

type Template = {
  id: string;
  name: string;
  description: string | null;
  content: string | null;
};

type Event = {
  id: string;
  name: string;
  date: string;
};

type Contact = {
  id: string;
  name: string;
  email: string;
};

type KPIs = {
  avgCycleTime: { value: number; change: string; chartData: number[] };
  avgAlcoholCogs: { value: number; change: string; chartData: number[] };
  avgRevenuePerHour: { value: number; change: string; chartData: number[] };
  totalSigned: { value: number; change: string; chartData: number[] };
};

interface ContractsClientProps {
  contracts: Contract[];
  templates: Template[];
  events: Event[];
  contacts: Contact[];
  orgId: string;
  kpis: KPIs;
}

const statusSteps = ["draft", "sent", "viewed", "signed", "completed"];

const quickActions = [
  { name: "New Contract", icon: Plus, color: "bg-olive-gold/20 text-olive-gold" },
  { name: "From Template", icon: FileText, color: "bg-olive-gold/20 text-olive-gold" },
];

export function ContractsClient({ contracts, templates, events, contacts, orgId, kpis }: ContractsClientProps) {
  const [filter, setFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ event_id: "", contact_id: "", template_id: "", title: "" });

  const statusCounts = {
    draft: contracts.filter(c => c.status === "draft").length,
    sent: contracts.filter(c => c.status === "sent").length,
    viewed: contracts.filter(c => c.status === "viewed").length,
    signed: contracts.filter(c => c.status === "signed").length,
    completed: contracts.filter(c => c.status === "completed").length,
    cancelled: contracts.filter(c => c.status === "cancelled").length,
  };

  const maxFunnel = Math.max(...Object.values(statusCounts), 1);

  const filteredContracts = contracts.filter(c => filter === "all" || c.status === filter);

  const handleCreate = async () => {
    try {
      const template = templates.find(t => t.id === form.template_id);
      await createContract(orgId, {
        event_id: form.event_id,
        contact_id: form.contact_id,
        template_id: form.template_id || undefined,
        title: form.title,
        content: template?.content || undefined,
        status: "draft",
      });
      setShowCreate(false);
      setForm({ event_id: "", contact_id: "", template_id: "", title: "" });
    } catch (error) {
      console.error("Error creating contract:", error);
    }
  };

  const handleSign = async (contractId: string) => {
    try {
      await updateContract(contractId, { status: "signed", signed_at: new Date().toISOString() });
    } catch (error) {
      console.error("Error signing contract:", error);
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatCurrency = (amount: number | null) => amount ? `$${amount.toLocaleString()}` : "-";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-warm-sand mt-1">
            {statusCounts.signed} signed · {statusCounts.draft} drafts · {statusCounts.sent} sent
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {quickActions.map(action => (
          <button key={action.name} onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-warm-sand/20 hover:border-warm-sand/40 transition-colors bg-charcoal">
            <div className={`p-1.5 rounded-lg ${action.color}`}><action.icon className="w-4 h-4" /></div>
            <span className="text-sm text-warm-white font-medium">{action.name}</span>
          </button>
        ))}
      </div>

      <div className="bg-charcoal border border-warm-sand/20 rounded-xl p-6">
        <h3 className="text-warm-white font-medium text-sm mb-4">Contract Pipeline</h3>
        <div className="grid grid-cols-5 gap-2">
          {statusSteps.map(status => (
            <div key={status} className="text-center">
              <div className="relative h-2 bg-warm-sand/10 rounded-full mb-2 overflow-hidden">
                <div className="h-full bg-olive-gold rounded-full transition-all duration-500"
                  style={{ width: `${(statusCounts[status as keyof typeof statusCounts] / maxFunnel) * 100}%` }} />
              </div>
              <p className="text-lg font-bold text-warm-white">{statusCounts[status as keyof typeof statusCounts]}</p>
              <p className="text-xs text-warm-sand capitalize">{status}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/contracts/kpi/avg-cycle-time">
          <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-olive-gold/20 p-3"><Clock className="h-6 w-6 text-olive-gold" /></div>
                <MiniLineChart data={kpis.avgCycleTime.chartData.length > 0 ? kpis.avgCycleTime.chartData : [10, 8, 12, 7, 6, 9, 5, 7, 6, 8, 5, 4]} color="#7D7254" />
              </div>
              <p className="text-meta text-warm-sand">Avg Cycle Time</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-bold text-warm-white">{kpis.avgCycleTime.value > 0 ? `${kpis.avgCycleTime.value} days` : "0 days"}</p>
                {kpis.avgCycleTime.change && kpis.avgCycleTime.value > 0 && (
                  <div className="flex items-center gap-1 text-sm text-olive-gold"><ArrowUpRight className="w-4 h-4" /><span>{kpis.avgCycleTime.change}</span></div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/contracts/kpi/alcohol-cogs">
          <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-olive-gold/20 p-3"><DollarSign className="h-6 w-6 text-olive-gold" /></div>
                <MiniLineChart data={kpis.avgAlcoholCogs.chartData.length > 0 ? kpis.avgAlcoholCogs.chartData : [25, 22, 20, 18, 19, 17, 16, 15, 14, 16, 15, 14]} color="#7D7254" />
              </div>
              <p className="text-meta text-warm-sand">Alcohol COGS</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-bold text-warm-white">{kpis.avgAlcoholCogs.value > 0 ? `${kpis.avgAlcoholCogs.value}%` : "0%"}</p>
                {kpis.avgAlcoholCogs.change && kpis.avgAlcoholCogs.value > 0 && (
                  <div className="flex items-center gap-1 text-sm text-olive-gold"><ArrowUpRight className="w-4 h-4" /><span>{kpis.avgAlcoholCogs.change}</span></div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/contracts/kpi/revenue-per-hour">
          <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-olive-gold/20 p-3"><TrendingUp className="h-6 w-6 text-olive-gold" /></div>
                <MiniLineChart data={kpis.avgRevenuePerHour.chartData.length > 0 ? kpis.avgRevenuePerHour.chartData : [150, 165, 180, 175, 190, 200, 195, 210, 205, 220, 215, 230]} color="#7D7254" />
              </div>
              <p className="text-meta text-warm-sand">Revenue/Hour</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-bold text-warm-white">{kpis.avgRevenuePerHour.value > 0 ? `$${kpis.avgRevenuePerHour.value}` : "$0"}</p>
                {kpis.avgRevenuePerHour.change && kpis.avgRevenuePerHour.value > 0 && (
                  <div className="flex items-center gap-1 text-sm text-olive-gold"><ArrowUpRight className="w-4 h-4" /><span>{kpis.avgRevenuePerHour.change}</span></div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/contracts/kpi/signed-contracts">
          <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-olive-gold/20 p-3"><FileCheck className="h-6 w-6 text-olive-gold" /></div>
                <MiniLineChart data={kpis.totalSigned.chartData.length > 0 ? kpis.totalSigned.chartData : [5, 8, 12, 10, 15, 18, 20, 22, 25, 28, 30, 32]} color="#7D7254" />
              </div>
              <p className="text-meta text-warm-sand">Signed Contracts</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-bold text-warm-white">{kpis.totalSigned.value} contracts</p>
                {kpis.totalSigned.change && kpis.totalSigned.value > 0 && (
                  <div className="flex items-center gap-1 text-sm text-olive-gold"><ArrowUpRight className="w-4 h-4" /><span>{kpis.totalSigned.change}</span></div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-olive-gold text-charcoal" : "text-warm-sand hover:text-warm-white bg-warm-sand/10"}`}>
              All ({contracts.length})
            </button>
            {(["draft", "sent", "viewed", "signed", "completed", "cancelled"] as const).map(status => (
              <button key={status} onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === status ? "bg-olive-gold text-charcoal" : "text-warm-sand hover:text-warm-white bg-warm-sand/10"}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
              </button>
            ))}
          </div>
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Contract
          </Button>
        </div>

        <Card className="bg-charcoal border-warm-sand/20">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-warm-sand/20">
                  <th className="text-left p-4 text-sm font-medium text-warm-sand">Contract</th>
                  <th className="text-left p-4 text-sm font-medium text-warm-sand">Client</th>
                  <th className="text-left p-4 text-sm font-medium text-warm-sand">Event</th>
                  <th className="text-left p-4 text-sm font-medium text-warm-sand">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-warm-sand">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-warm-sand">Created</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-warm-sand">No contracts found. Create your first contract to get started.</td></tr>
                ) : filteredContracts.map(contract => (
                  <tr key={contract.id} className="border-b border-warm-sand/10 hover:bg-warm-sand/5">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-warm-sand" />
                        <span className="text-warm-white font-medium">{contract.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-warm-white">{contract.contact?.name || "-"}</td>
                    <td className="p-4 text-warm-sand">{contract.event?.name || "-"}</td>
                    <td className="p-4 text-warm-white">{formatCurrency(contract.total_amount)}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-olive-gold/20 text-olive-gold">
                        {contract.status === "signed" || contract.status === "completed" ? <CheckCircle className="w-3 h-3" /> :
                         contract.status === "cancelled" ? <XCircle className="w-3 h-3" /> :
                         contract.status === "sent" ? <Send className="w-3 h-3" /> :
                         contract.status === "viewed" ? <Eye className="w-3 h-3" /> :
                         <FileText className="w-3 h-3" />}
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-warm-sand text-sm">{formatDate(contract.created_at)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {contract.status === "draft" && (
                          <button onClick={() => handleSign(contract.id)} className="p-1.5 text-olive-gold hover:text-olive-gold/70" title="Mark as Signed">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 text-warm-sand hover:text-warm-white"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 text-warm-sand hover:text-warm-white"><FileText className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCreate(false)} />
          <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-warm-white mb-6">Create Contract</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Event</label>
                <Select value={form.event_id} onValueChange={v => setForm({ ...form, event_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger>
                  <SelectContent>
                    {events.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="label">Client</label>
                <Select value={form.contact_id} onValueChange={v => setForm({ ...form, contact_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="label">Template</label>
                <Select value={form.template_id} onValueChange={v => setForm({ ...form, template_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select template (optional)" /></SelectTrigger>
                  <SelectContent>
                    {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Input label="Contract Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Smith Wedding Contract" />
              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleCreate} disabled={!form.event_id || !form.contact_id || !form.title} className="flex-1">Create</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
