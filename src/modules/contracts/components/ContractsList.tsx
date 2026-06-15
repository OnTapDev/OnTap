"use client";

import { useState } from "react";
import { Card, CardContent } from "@/ui/primitives";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives";
import { FileText, Plus, MoreHorizontal, Eye, CheckCircle, XCircle, Send } from "lucide-react";
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

interface ContractsListProps {
  contracts: Contract[];
  templates: Template[];
  events: Event[];
  contacts: Contact[];
  orgId: string;
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  draft: { bg: "bg-warm-sand/20", text: "text-warm-sand", icon: <FileText className="w-3 h-3" /> },
  sent: { bg: "bg-blue-500/20", text: "text-blue-400", icon: <Send className="w-3 h-3" /> },
  viewed: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: <Eye className="w-3 h-3" /> },
  signed: { bg: "bg-green-500/20", text: "text-green-400", icon: <CheckCircle className="w-3 h-3" /> },
  completed: { bg: "bg-olive-gold/20", text: "text-olive-gold", icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { bg: "bg-red-500/20", text: "text-red-400", icon: <XCircle className="w-3 h-3" /> },
};

export function ContractsList({ contracts, templates, events, contacts, orgId }: ContractsListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    event_id: "",
    contact_id: "",
    template_id: "",
    title: "",
  });

  const filteredContracts = contracts.filter(c => {
    const matchesFilter = filter === "all" || c.status === filter;
    return matchesFilter;
  });

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
      await updateContract(contractId, {
        status: "signed",
        signed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error signing contract:", error);
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatCurrency = (amount: number | null) => amount ? `$${amount.toLocaleString()}` : "-";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === "all" ? "bg-olive-gold text-charcoal" : "text-warm-sand hover:text-warm-white bg-warm-sand/10"
            }`}
          >
            All ({contracts.length})
          </button>
          {Object.keys(statusConfig).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === status ? "bg-olive-gold text-charcoal" : "text-warm-sand hover:text-warm-white bg-warm-sand/10"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({contracts.filter(c => c.status === status).length})
            </button>
          ))}
        </div>
        <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Contract
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
                <tr>
                  <td colSpan={7} className="p-8 text-center text-warm-sand">
                    No contracts found. Create your first contract to get started.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => (
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
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[contract.status]?.bg} ${statusConfig[contract.status]?.text}`}>
                        {statusConfig[contract.status]?.icon}
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-warm-sand text-sm">{formatDate(contract.created_at)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {contract.status === "draft" && (
                          <button 
                            onClick={() => handleSign(contract.id)}
                            className="p-1.5 text-green-400 hover:text-green-300" 
                            title="Mark as Signed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 text-warm-sand hover:text-warm-white">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-warm-sand hover:text-warm-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCreate(false)} />
          <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-warm-white mb-6">Create Contract</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Event</label>
                <Select value={form.event_id} onValueChange={(v) => setForm({...form, event_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger>
                  <SelectContent>
                    {events.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="label">Client</label>
                <Select value={form.contact_id} onValueChange={(v) => setForm({...form, contact_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="label">Template</label>
                <Select value={form.template_id} onValueChange={(v) => setForm({...form, template_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select template (optional)" /></SelectTrigger>
                  <SelectContent>
                    {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Input
                label="Contract Title"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="e.g., Smith Wedding Contract"
              />

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleCreate} disabled={!form.event_id || !form.contact_id || !form.title} className="flex-1">
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
