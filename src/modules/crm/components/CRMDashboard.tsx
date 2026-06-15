"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives";
import { 
  Users, 
  DollarSign, 
  Clock,
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  FileText,
  ArrowUpRight,
  Calendar,
  X
} from "lucide-react";
import Link from "next/link";
import { MiniLineChart } from "@/ui/components/MiniLineChart";
import { createContact } from "@/modules/crm/actions/contacts";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  source: string | null;
  notes: string | null;
  tags: string[];
  stage_id: string | null;
  created_at: string;
  stage: { id: string; name: string; color: string } | null;
};

type Stage = {
  id: string;
  name: string;
  color: string;
  order: number;
};

type Event = {
  id: string;
  name: string;
  date: string;
  status: string;
  total_price: number;
  contact: { name: string } | null;
};

type DashboardKPI = {
  value: number;
  change: string;
  chartData: number[];
};

type CRMKPIData = {
  "total-leads": DashboardKPI;
  "new-inquiries": DashboardKPI;
  "active-quotes": DashboardKPI;
};

interface CRMDashboardProps {
  contacts: Contact[];
  stages: Stage[];
  events: Event[];
  initialView?: "overview" | "pipeline" | "contacts";
  kpis?: CRMKPIData;
  revenueKpi?: DashboardKPI;
  orgId: string;
}

export function CRMDashboard({ contacts, stages, events, initialView = "overview", kpis, revenueKpi, orgId }: CRMDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"overview" | "pipeline" | "contacts">(initialView);
  const [showAddLead, setShowAddLead] = useState(false);
  const [addingLead, setAddingLead] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    source: "",
    notes: "",
    stage_id: "",
  });

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingLead(true);
    try {
      await createContact(orgId, {
        ...leadForm,
        stage_id: leadForm.stage_id || undefined,
      });
      setShowAddLead(false);
      setLeadForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        role: "",
        source: "",
        notes: "",
        stage_id: "",
      });
    } catch (error) {
      console.error("Error creating lead:", error);
    } finally {
      setAddingLead(false);
    }
  };

  const stats = useMemo(() => {
    const totalContacts = contacts.length;
    const newInquiries = contacts.filter(c => c.stage?.name === "New Inquiry").length;
    const quoted = contacts.filter(c => c.stage?.name === "Quoted").length;
    const booked = contacts.filter(c => c.stage?.name === "Booked").length;
    const totalRevenue = events
      .filter(e => e.status === "completed" || e.status === "deposit_paid")
      .reduce((sum, e) => sum + e.total_price, 0);
    
    return { totalContacts, newInquiries, quoted, booked, totalRevenue };
  }, [contacts, events]);

  const kpiStats = useMemo(() => {
    if (!kpis) return { leadsChange: "+0%", revenueChange: "+0%" };
    return {
      leadsChange: kpis["total-leads"]?.change || "+0%",
      revenueChange: revenueKpi?.change || "+0%"
    };
  }, [kpis, revenueKpi]);

  const leadsChartData = kpis?.["total-leads"]?.chartData || [];
  const inquiriesChartData = kpis?.["new-inquiries"]?.chartData || [];
  const quotesChartData = kpis?.["active-quotes"]?.chartData || [];
  const revenueChartData = revenueKpi?.chartData || [];

  const pipelineData = useMemo(() => {
    return stages.map(stage => ({
      ...stage,
      count: contacts.filter(c => c.stage_id === stage.id).length,
      value: contacts
        .filter(c => c.stage_id === stage.id)
        .reduce((sum, c) => sum + (c.email ? 1 : 0), 0)
    }));
  }, [stages, contacts]);

  const recentActivity = useMemo(() => {
    const activities: Array<{ id: string; type: string; text: string; time: string; contact: string }> = [];
    
    contacts.slice(0, 5).forEach(c => {
      activities.push({
        id: c.id,
        type: "contact",
        text: `New contact added`,
        time: new Date(c.created_at).toLocaleDateString(),
        contact: c.name
      });
    });
    
    events.slice(0, 5).forEach(e => {
      activities.push({
        id: e.id,
        type: "event",
        text: `${e.status.replace("_", " ")}`,
        time: new Date(e.date).toLocaleDateString(),
        contact: e.contact?.name || ""
      });
    });
    
    return activities.slice(0, 10);
  }, [contacts, events]);

  const filteredContacts = useMemo(() => {
    if (!searchTerm) return contacts;
    const term = searchTerm.toLowerCase();
    return contacts.filter(c => 
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.company?.toLowerCase().includes(term)
    );
  }, [contacts, searchTerm]);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-screen-title text-warm-white">CRM</h1>
          <p className="text-warm-sand mt-1">Manage leads, clients, and opportunities</p>
        </div>
        <div className="flex gap-2">
          <Link href="/contacts" className="btn-secondary text-sm">
            Legacy View
          </Link>
          <button 
            className="btn-primary text-sm flex items-center gap-2"
            onClick={() => setShowAddLead(true)}
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Link href="/crm/kpi/total-leads">
          <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-olive-gold/20 p-3">
                  <Users className="h-6 w-6 text-olive-gold" />
                </div>
                <MiniLineChart data={leadsChartData.length > 0 ? leadsChartData : [65, 72, 68, 75, 82, 78, 85, 90, 88, 92, 95, 100]} color="#7D7254" />
              </div>
              <p className="text-meta text-warm-sand">Total Leads</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-bold text-warm-white">{stats.totalContacts} leads</p>
                <div className="flex items-center gap-1 text-sm text-olive-gold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{kpiStats.leadsChange}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/crm/kpi/new-inquiries">
          <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-olive-gold/20 p-3">
                  <Clock className="h-6 w-6 text-olive-gold" />
                </div>
                <MiniLineChart data={inquiriesChartData.length > 0 ? inquiriesChartData : [30, 50, 40, 60, 80]} color="#7D7254" />
              </div>
              <p className="text-meta text-warm-sand">New Inquiries</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-bold text-warm-white">{stats.newInquiries} inquiries</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/crm/kpi/active-quotes">
          <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-olive-gold/20 p-3">
                  <FileText className="h-6 w-6 text-olive-gold" />
                </div>
                <MiniLineChart data={quotesChartData.length > 0 ? quotesChartData : [20, 40, 35, 55, 45, 65, 60, 75, 70, 85, 80, 90]} color="#7D7254" />
              </div>
              <p className="text-meta text-warm-sand">Active Quotes</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-bold text-warm-white">{stats.quoted} quotes</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/crm/kpi/revenue">
          <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-olive-gold/20 p-3">
                  <DollarSign className="h-6 w-6 text-olive-gold" />
                </div>
                <MiniLineChart data={revenueChartData.length > 0 ? revenueChartData : [40, 55, 45, 70, 60, 80, 75, 90, 85, 95, 88, 100]} color="#7D7254" />
              </div>
              <p className="text-meta text-warm-sand">Revenue</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-bold text-warm-white">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center gap-1 text-sm text-olive-gold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{kpiStats.revenueChange}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView("overview")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === "overview" ? "bg-olive-gold text-charcoal" : "text-warm-sand hover:text-warm-white"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setView("pipeline")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === "pipeline" ? "bg-olive-gold text-charcoal" : "text-warm-sand hover:text-warm-white"
          }`}
        >
          Pipeline
        </button>
        <button
          onClick={() => setView("contacts")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === "contacts" ? "bg-olive-gold text-charcoal" : "text-warm-sand hover:text-warm-white"
          }`}
        >
          Contacts
        </button>
      </div>

      {view === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div 
            onClick={() => setView("pipeline")}
            className="cursor-pointer"
          >
            <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-warm-white">Pipeline Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pipelineData.map((stage) => (
                    <div key={stage.id} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-warm-white text-sm">{stage.name}</span>
                          <span className="text-warm-sand text-sm">{stage.count} leads</span>
                        </div>
                        <div className="h-2 bg-warm-sand/10 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${(stage.count / stats.totalContacts) * 100}%`,
                              backgroundColor: stage.color 
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div 
            onClick={() => setView("contacts")}
            className="cursor-pointer"
          >
            <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-warm-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-warm-sand/10 last:border-0">
                      <div className="mt-1">
                        {activity.type === "contact" ? (
                          <Users className="w-4 h-4 text-warm-sand" />
                        ) : (
                          <Calendar className="w-4 h-4 text-warm-sand" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-warm-white text-sm">{activity.text}</p>
                        <p className="text-warm-sand text-xs">{activity.contact} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <p className="text-warm-sand text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {view === "pipeline" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageContacts = contacts.filter(c => c.stage_id === stage.id);
            return (
              <div key={stage.id} className="flex-shrink-0 w-72 bg-charcoal border border-warm-sand/20 rounded-xl">
                <div 
                  className="p-3 border-b rounded-t-xl"
                  style={{ borderTopColor: stage.color, borderTopWidth: 3, backgroundColor: `${stage.color}10` }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-warm-white">{stage.name}</h3>
                    <span className="text-sm text-warm-sand bg-warm-sand/20 px-2 py-0.5 rounded-full">
                      {stageContacts.length}
                    </span>
                  </div>
                </div>
                
                <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                  {stageContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3 bg-charcoal border border-warm-sand/10 rounded-lg hover:border-warm-sand/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-warm-white font-medium text-sm">{contact.name}</p>
                          {contact.company && (
                            <p className="text-xs text-warm-sand mt-0.5">{contact.company}</p>
                          )}
                        </div>
                        <button className="text-warm-sand hover:text-warm-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-warm-sand">
                        {contact.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.email}</span>}
                      </div>
                      {contact.role && (
                        <span className="inline-block mt-2 text-xs bg-warm-sand/20 text-warm-sand px-2 py-0.5 rounded-full">
                          {contact.role}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "contacts" && (
        <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-warm-white">All Contacts</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-sand" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-charcoal border border-warm-sand/30 rounded-lg text-warm-white text-sm w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-warm-sand/20">
                    <th className="text-left p-3 text-sm font-medium text-warm-sand">Name</th>
                    <th className="text-left p-3 text-sm font-medium text-warm-sand">Company</th>
                    <th className="text-left p-3 text-sm font-medium text-warm-sand">Role</th>
                    <th className="text-left p-3 text-sm font-medium text-warm-sand">Stage</th>
                    <th className="text-left p-3 text-sm font-medium text-warm-sand">Source</th>
                    <th className="text-left p-3 text-sm font-medium text-warm-sand">Added</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-warm-sand/10 hover:bg-warm-sand/5">
                      <td className="p-3">
                        <div>
                          <p className="text-warm-white font-medium">{contact.name}</p>
                          <p className="text-xs text-warm-sand">{contact.email}</p>
                        </div>
                      </td>
                      <td className="p-3 text-warm-white">{contact.company || "-"}</td>
                      <td className="p-3">
                        {contact.role && (
                          <span className="text-xs bg-warm-sand/20 text-warm-sand px-2 py-1 rounded-full">
                            {contact.role}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {contact.stage ? (
                          <span 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${contact.stage.color}20`, color: contact.stage.color }}
                          >
                            {contact.stage.name}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="p-3 text-warm-sand text-sm">{contact.source || "-"}</td>
                      <td className="p-3 text-warm-sand text-sm">{formatDate(contact.created_at)}</td>
                      <td className="p-3">
                        <button className="p-1 text-warm-sand hover:text-warm-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredContacts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-warm-sand">
                        No contacts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {showAddLead && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          onClick={() => setShowAddLead(false)}
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddLead(false)} />
          <div 
            className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-warm-white">Add New Lead</h2>
              <button onClick={() => setShowAddLead(false)} className="text-warm-sand hover:text-warm-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddLead} className="space-y-4">
              <Input
                label="Name *"
                value={leadForm.name}
                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                placeholder="John Smith"
                required
              />
              
              <Input
                label="Email"
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                placeholder="john@example.com"
              />
              
              <Input
                label="Phone"
                type="tel"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
              
              <Input
                label="Company"
                value={leadForm.company}
                onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                placeholder="Acme Inc."
              />
              
              <div>
                <label className="label">Role</label>
                <Select
                  value={leadForm.role}
                  onValueChange={(value) => setLeadForm({ ...leadForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bride">Bride</SelectItem>
                    <SelectItem value="groom">Groom</SelectItem>
                    <SelectItem value="event_planner">Event Planner</SelectItem>
                    <SelectItem value="venue_manager">Venue Manager</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="birthday_host">Birthday Host</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="label">Stage</label>
                <Select
                  value={leadForm.stage_id}
                  onValueChange={(value) => setLeadForm({ ...leadForm, stage_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="label">Source</label>
                <Select
                  value={leadForm.source}
                  onValueChange={(value) => setLeadForm({ ...leadForm, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How did they find you?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="venue">Venue Referral</SelectItem>
                    <SelectItem value="wedding_show">Wedding Show</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Textarea
                label="Notes"
                value={leadForm.notes}
                onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                placeholder="Any additional notes..."
              />
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddLead(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addingLead || !leadForm.name}
                  className="flex-1"
                >
                  {addingLead ? "Adding..." : "Add Lead"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
