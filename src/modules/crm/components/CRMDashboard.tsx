"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge,
} from "@/ui/primitives";
import {
  Users, DollarSign, Clock, Plus, Search, Mail, MoreHorizontal,
  MessageSquare, Phone, Calendar, X, ArrowUpRight, Trash2, Edit3,
  MapPin, Send, ChevronRight, FileText, User, Tag, Loader2
} from "lucide-react";
import Link from "next/link";
import { MiniLineChart } from "@/ui/components/MiniLineChart";
import { createContact, updateContact, deleteContact } from "@/modules/crm/actions/contacts";
import { sendEmail, sendSMS } from "@/modules/crm/actions/messaging";
import type { PipelineKPIs } from "@/modules/crm/actions/contacts";
import { CommentsSection } from "@/modules/crm/components/CommentsSection";

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
  updated_at: string;
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
  contact_id: string;
  name: string;
  type: string;
  date: string;
  status: string;
  total_price: number;
  venue_name: string | null;
  guest_count: number;
  contact: { name: string } | null;
};

type Message = {
  id: string;
  contact_id: string;
  type: "email" | "sms";
  subject: string;
  body: string;
  status: string;
  recipient: string;
  created_at: string;
  contact: { name: string; email: string | null; phone: string | null } | null;
};

interface CRMDashboardProps {
  contacts: Contact[];
  stages: Stage[];
  events: Event[];
  messages: Message[];
  initialView?: "overview" | "pipeline" | "contacts" | "messages";
  pipelineKpis?: PipelineKPIs;
  orgId: string;
}

const SOURCE_LABELS: Record<string, string> = {
  website: "Website", instagram: "Instagram", google: "Google",
  facebook: "Facebook", referral: "Referral", venue: "Venue",
  wedding_show: "Wedding Show", other: "Other",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: "Wedding", corporate: "Corporate", private_party: "Private Party",
  birthday: "Birthday", festival: "Festival", other: "Other",
};

const EVENT_STATUS_BADGE: Record<string, "warning" | "default" | "success" | "secondary" | "destructive"> = {
  new_inquiry: "warning", quoted: "default", tentative: "secondary",
  booked: "success", deposit_paid: "success", completed: "success", cancelled: "destructive",
};

export function CRMDashboard({
  contacts, stages, events, messages, initialView = "overview",
  pipelineKpis, orgId
}: CRMDashboardProps) {
  const router = useRouter();
  const [view, setView] = useState(initialView);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [showAddLead, setShowAddLead] = useState(false);
  const [addingLead, setAddingLead] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [leadForm, setLeadForm] = useState({
    name: "", email: "", phone: "", company: "", role: "",
    source: "", notes: "", stage_id: "",
  });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", email: "", phone: "", company: "", role: "", source: "", notes: "", stage_id: "",
  });
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingContact, setDeletingContact] = useState(false);
  const [msgContactId, setMsgContactId] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<"email" | "sms">("email");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [msgSuccess, setMsgSuccess] = useState(false);
  const [stageUpdating, setStageUpdating] = useState<Set<string>>(new Set());
  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node)) {
        setOpenRowMenu(null);
      }
    }
    if (openRowMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openRowMenu]);

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingLead(true);
    setLeadError("");
    try {
      await createContact(orgId, {
        ...leadForm,
        stage_id: leadForm.stage_id || undefined,
      });
      setShowAddLead(false);
      setLeadForm({ name: "", email: "", phone: "", company: "", role: "", source: "", notes: "", stage_id: "" });
      router.refresh();
    } catch (error) {
      setLeadError(error instanceof Error ? error.message : "Failed to create lead");
    } finally {
      setAddingLead(false);
    }
  };

  const handleEditSave = async () => {
    if (!selectedContact) return;
    setEditSaving(true);
    setEditError("");
    try {
      await updateContact(selectedContact.id, {
        name: editForm.name || undefined,
        email: editForm.email || undefined,
        phone: editForm.phone || undefined,
        company: editForm.company || undefined,
        role: editForm.role || undefined,
        source: editForm.source || undefined,
        notes: editForm.notes || undefined,
        stage_id: editForm.stage_id || undefined,
      });
      setEditingContact(false);
      router.refresh();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Failed to update contact");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    setDeletingContact(true);
    try {
      await deleteContact(selectedContact.id);
      setShowDetailPanel(false);
      setShowDeleteConfirm(false);
      setSelectedContact(null);
      router.refresh();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Failed to delete contact");
    } finally {
      setDeletingContact(false);
    }
  };

  const startEditing = (contact: Contact) => {
    setEditForm({
      name: contact.name,
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      role: contact.role || "",
      source: contact.source || "",
      notes: contact.notes || "",
      stage_id: contact.stage_id || "",
    });
    setEditError("");
    setEditingContact(true);
  };

  const handleStageChange = async (contactId: string, newStageId: string) => {
    setStageUpdating(prev => new Set(prev).add(contactId));
    try {
      await updateContact(contactId, { stage_id: newStageId || undefined });
      router.refresh();
    } catch {
    } finally {
      setStageUpdating(prev => {
        const next = new Set(prev);
        next.delete(contactId);
        return next;
      });
    }
  };

  const handleSendMessage = async () => {
    if (!msgBody.trim() || !msgContactId) return;
    const contact = contacts.find(c => c.id === msgContactId);
    if (!contact) return;
    setMsgSending(true);
    setMsgError("");
    setMsgSuccess(false);
    try {
      if (msgType === "email") {
        if (!contact.email) throw new Error("No email address for this contact");
        await sendEmail(contact.email, msgSubject, msgBody, contact.id, orgId);
      } else {
        if (!contact.phone) throw new Error("No phone number for this contact");
        await sendSMS(contact.phone, msgBody, contact.id, orgId);
      }
      setMsgSuccess(true);
      setMsgSubject("");
      setMsgBody("");
      setTimeout(() => setMsgSuccess(false), 2000);
    } catch (err) {
      setMsgError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setMsgSending(false);
    }
  };

  const stats = useMemo(() => {
    const total = contacts.length;
    const upcoming = events.filter(e =>
      new Date(e.date) >= new Date() &&
      ["booked", "deposit_paid"].includes(e.status)
    ).length;
    const pendingQuoteValue = events
      .filter(e => e.status === "quoted" || e.status === "tentative")
      .reduce((s, e) => s + e.total_price, 0);
    const thisWeek = messages.filter(m => {
      const d = new Date(m.created_at);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      return d >= weekAgo;
    }).length;
    const revenue = events
      .filter(e => e.status === "completed")
      .reduce((s, e) => s + e.total_price, 0);

    const sourceBreakdown: Record<string, { count: number; booked: number }> = {};
    const sourceOrder = ["website", "instagram", "google", "facebook", "referral", "venue", "wedding_show", "other"];
    sourceOrder.forEach(s => { sourceBreakdown[s] = { count: 0, booked: 0 }; });
    contacts.forEach(c => {
      const key = (c.source || "other").toLowerCase().replace(/\s+/g, "_");
      if (!sourceBreakdown[key]) sourceBreakdown[key] = { count: 0, booked: 0 };
      sourceBreakdown[key].count++;
      const hasBooked = events.some(e => e.contact_id === c.id && (e.status === "booked" || e.status === "deposit_paid" || e.status === "completed"));
      if (hasBooked) sourceBreakdown[key].booked++;
    });

    const sourceLabels: Record<string, string> = {
      website: "Website", instagram: "Instagram", google: "Google",
      facebook: "Facebook", referral: "Referral", venue: "Venue",
      wedding_show: "Wedding Show", other: "Other",
    };

    return { total, upcoming, pendingQuoteValue, thisWeek, revenue, sourceBreakdown, sourceLabels, sourceOrder };
  }, [contacts, events, messages]);

  const filteredContacts = useMemo(() => {
    let result = contacts;
    if (sourceFilter) {
      result = result.filter(c => (c.source || "other").toLowerCase().replace(/\s+/g, "_") === sourceFilter);
    }
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.name?.toLowerCase().includes(t) ||
        c.email?.toLowerCase().includes(t) ||
        c.company?.toLowerCase().includes(t) ||
        c.phone?.toLowerCase().includes(t) ||
        c.role?.toLowerCase().includes(t)
      );
    }
    return result;
  }, [contacts, searchTerm, sourceFilter]);

  const sourceChartData = useMemo(() => {
    const order = stats.sourceOrder;
    const maxCount = Math.max(...order.map(s => stats.sourceBreakdown[s]?.count || 0), 1);
    return order.map(s => ({
      source: stats.sourceLabels[s] || s,
      count: stats.sourceBreakdown[s]?.count || 0,
      booked: stats.sourceBreakdown[s]?.booked || 0,
      pct: Math.round(((stats.sourceBreakdown[s]?.count || 0) / (stats.total || 1)) * 100),
      barWidth: Math.round(((stats.sourceBreakdown[s]?.count || 0) / maxCount) * 100),
    }));
  }, [stats]);

  const leadsByDay = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    }).map(dayStr => contacts.filter(c => c.created_at?.startsWith(dayStr)).length);
  }, [contacts]);

  const messagesByDay = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    }).map(dayStr => messages.filter(m => m.created_at?.startsWith(dayStr)).length);
  }, [messages]);

  const revenueByMonth = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      const monthStr = d.toISOString().slice(0, 7);
      return events
        .filter(e => e.status === "completed" && e.date?.startsWith(monthStr))
        .reduce((s, e) => s + e.total_price, 0);
    });
  }, [events]);

  const pendingByMonth = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      const monthStr = d.toISOString().slice(0, 7);
      return events
        .filter(e => (e.status === "quoted" || e.status === "tentative") && e.date?.startsWith(monthStr))
        .reduce((s, e) => s + e.total_price, 0);
    });
  }, [events]);

  const eventsByMonth = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthStr = d.toISOString().slice(0, 7);
      return events.filter(e => e.date?.startsWith(monthStr) && e.status !== "cancelled").length;
    });
  }, [events]);

  const upcomingEvents = useMemo(() =>
    events
      .filter(e => new Date(e.date) >= new Date() && e.status !== "cancelled")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5),
  [events]);

  const recentActivity = useMemo(() => {
    const items: Array<{ id: string; type: string; text: string; time: string; }> = [];
    contacts.slice(0, 5).forEach(c => {
      items.push({
        id: `c-${c.id}`, type: "contact", text: `New lead: ${c.name}`,
        time: new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    });
    messages.slice(0, 5).forEach(m => {
      items.push({
        id: `m-${m.id}`, type: "message",
        text: `${m.type === "email" ? "Email" : "SMS"} ${m.subject ? `"${m.subject}"` : ""} to ${m.contact?.name || m.recipient}`,
        time: new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    });
    events.filter(e => e.status === "booked" || e.status === "deposit_paid").slice(0, 5).forEach(e => {
      items.push({
        id: `e-${e.id}`, type: "event", text: `Event booked: ${e.name}${e.contact?.name ? ` - ${e.contact.name}` : ""}`,
        time: new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    });
    return items.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 10);
  }, [contacts, messages, events]);

  const contactEvents = (contactId: string) =>
    events.filter(e => e.contact_id === contactId);

  const contactMessages = (contactId: string) =>
    messages.filter(m => m.contact_id === contactId);

  const formatCurrency = (n: number) => `$${n.toLocaleString()}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatShortDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const selectedMsgs = msgContactId ? contactMessages(msgContactId) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMsgs.length]);

  const msgContactList = useMemo(() => {
    const contactSet = new Map<string, { contact: Contact; lastMsg: Message | null }>();
    contacts.forEach(c => contactSet.set(c.id, { contact: c, lastMsg: null }));
    messages.forEach(m => {
      const existing = contactSet.get(m.contact_id);
      if (existing && (!existing.lastMsg || new Date(m.created_at) > new Date(existing.lastMsg.created_at))) {
        contactSet.set(m.contact_id, { contact: existing.contact, lastMsg: m });
      }
    });
    return Array.from(contactSet.values())
      .sort((a, b) => {
        if (a.lastMsg && b.lastMsg) return new Date(b.lastMsg.created_at).getTime() - new Date(a.lastMsg.created_at).getTime();
        if (a.lastMsg) return -1;
        if (b.lastMsg) return 1;
        return a.contact.name.localeCompare(b.contact.name);
      });
  }, [contacts, messages]);

  const getEventTypeBadge = (type: string) => EVENT_TYPE_LABELS[type] || type;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-screen-title text-warm-white">CRM</h1>
          <p className="text-warm-sand mt-1">Manage leads, events, and client communications</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddLead(true)} aria-label="Add new lead">
            <Plus className="w-4 h-4" />
            Add Lead
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card className="bg-charcoal border-warm-sand/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-olive-gold/20 p-2" aria-hidden="true"><Users className="h-5 w-5 text-olive-gold" /></div>
              <MiniLineChart data={leadsByDay} color="#7D7254" />
            </div>
            <p className="text-meta text-warm-sand">Total Leads</p>
            <p className="text-xl font-bold text-warm-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-warm-sand/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-olive-gold/20 p-2" aria-hidden="true"><Calendar className="h-5 w-5 text-olive-gold" /></div>
              <MiniLineChart data={eventsByMonth} color="#7D7254" />
            </div>
            <p className="text-meta text-warm-sand">Upcoming Events</p>
            <p className="text-xl font-bold text-warm-white">{stats.upcoming}</p>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-warm-sand/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-olive-gold/20 p-2" aria-hidden="true"><FileText className="h-5 w-5 text-olive-gold" /></div>
              <MiniLineChart data={pendingByMonth} color="#7D7254" />
            </div>
            <p className="text-meta text-warm-sand">Pending Quotes</p>
            <p className="text-xl font-bold text-warm-white">{formatCurrency(stats.pendingQuoteValue)}</p>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-warm-sand/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-olive-gold/20 p-2" aria-hidden="true"><Mail className="h-5 w-5 text-olive-gold" /></div>
              <MiniLineChart data={messagesByDay} color="#7D7254" />
            </div>
            <p className="text-meta text-warm-sand">Messages This Week</p>
            <p className="text-xl font-bold text-warm-white">{stats.thisWeek}</p>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-warm-sand/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-olive-gold/20 p-2" aria-hidden="true"><DollarSign className="h-5 w-5 text-olive-gold" /></div>
              <MiniLineChart data={revenueByMonth} color="#7D7254" />
            </div>
            <p className="text-meta text-warm-sand">Revenue</p>
            <p className="text-xl font-bold text-warm-white">{formatCurrency(stats.revenue)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-1 mb-6 border-b border-warm-sand/20" role="tablist" aria-label="CRM sections">
        {(["overview", "contacts", "pipeline", "messages"] as const).map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={view === tab}
            onClick={() => setView(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              view === tab
                ? "border-olive-gold text-olive-gold"
                : "border-transparent text-warm-sand hover:text-warm-white"
            }`}
          >
            {tab === "overview" && "Overview"}
            {tab === "contacts" && "Contacts"}
            {tab === "pipeline" && "Pipeline"}
            {tab === "messages" && "Messages"}
          </button>
        ))}
      </div>

      {view === "overview" && (<>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card className="bg-charcoal border-warm-sand/20">
              <CardHeader><CardTitle className="text-warm-white">Recent Activity</CardTitle></CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-1">
                    {recentActivity.map((a) => (
                      <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-warm-sand/10 last:border-0">
                        <div className="mt-0.5 shrink-0" aria-hidden="true">
                          {a.type === "contact" && <User className="w-4 h-4 text-olive-gold" />}
                          {a.type === "message" && <Mail className="w-4 h-4 text-olive-gold" />}
                          {a.type === "event" && <Calendar className="w-4 h-4 text-olive-gold" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-warm-white truncate">{a.text}</p>
                          <p className="text-xs text-warm-sand mt-0.5">{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-warm-sand text-sm text-center py-6">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-charcoal border-warm-sand/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-warm-white">Upcoming Events</CardTitle>
                <Link href="/events" className="text-xs text-olive-gold hover:underline flex items-center gap-1" aria-label="View all events">
                  View all <ChevronRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((e) => (
                      <div key={e.id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center min-w-[40px]">
                          <span className="text-xs font-bold text-olive-gold">
                            {new Date(e.date).toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="text-lg font-bold text-warm-white leading-none">
                            {new Date(e.date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-warm-white truncate">{e.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-warm-sand">{e.contact?.name}</span>
                            {e.venue_name && (
                              <><span className="text-warm-sand/40">|</span><span className="text-xs text-warm-sand truncate">{e.venue_name}</span></>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={EVENT_STATUS_BADGE[e.status] || "secondary"} className="text-[10px] px-1.5 py-0">
                              {e.status.replace(/_/g, " ")}
                            </Badge>
                            {e.total_price > 0 && <span className="text-xs text-olive-gold font-medium">{formatCurrency(e.total_price)}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-warm-sand text-sm text-center py-6">No upcoming events</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-charcoal border-warm-sand/20">
              <CardHeader><CardTitle className="text-warm-white">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={() => setShowAddLead(true)} variant="secondary" className="w-full justify-start" aria-label="Add new lead">
                  <Plus className="w-4 h-4" aria-hidden="true" /> Add New Lead
                </Button>
                <Button onClick={() => setView("messages")} variant="secondary" className="w-full justify-start" aria-label="Go to messages">
                  <Send className="w-4 h-4" aria-hidden="true" /> Send a Message
                </Button>
                <Link href="/events">
                  <Button variant="secondary" className="w-full justify-start" aria-label="View events">
                    <Calendar className="w-4 h-4" aria-hidden="true" /> View Events
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6">
          <Card className="bg-charcoal border-warm-sand/20">
            <CardHeader><CardTitle className="text-warm-white">Lead Sources</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {sourceChartData.map(d => (
                  <div key={d.source} className="p-3 rounded-lg bg-warm-sand/5 border border-warm-sand/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-warm-white capitalize">{d.source}</span>
                      <span className="text-sm font-bold text-warm-white">{d.count}</span>
                    </div>
                    <div className="w-full h-2 bg-charcoal rounded-full overflow-hidden" role="progressbar" aria-valuenow={d.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${d.source}: ${d.pct}% of leads`}>
                      <div className="h-full bg-olive-gold rounded-full transition-all" style={{ width: `${d.barWidth}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-warm-sand">{d.pct}% of total</span>
                      <span className="text-[10px] text-olive-gold">{d.booked} booked</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-warm-sand mt-3">Sources with higher bar counts indicate where most leads originate. &ldquo;Booked&rdquo; shows conversions per channel.</p>
            </CardContent>
          </Card>
        </div>
      </> )}

      {view === "contacts" && (
        <div>
          <Card className="bg-charcoal border-warm-sand/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-warm-white">All Contacts</CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-3 py-2 bg-charcoal border border-warm-sand/30 rounded-lg text-warm-white text-sm cursor-pointer hover:border-olive-gold transition-colors focus:outline-none focus:ring-1 focus:ring-olive-gold"
                  aria-label="Filter by source"
                >
                  <option value="">All Sources</option>
                  {stats.sourceOrder.map(s => (
                    <option key={s} value={s}>{stats.sourceLabels[s]}</option>
                  ))}
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-sand" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-charcoal border border-warm-sand/30 rounded-lg text-warm-white text-sm w-56 placeholder:text-warm-sand focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold"
                    aria-label="Search contacts"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full" role="table">
                  <thead>
                    <tr className="border-b border-warm-sand/20">
                      <th className="text-left p-3 text-sm font-medium text-warm-sand" scope="col">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-warm-sand" scope="col">Event</th>
                      <th className="text-left p-3 text-sm font-medium text-warm-sand" scope="col">Event Date</th>
                      <th className="text-left p-3 text-sm font-medium text-warm-sand" scope="col">Stage</th>
                      <th className="text-left p-3 text-sm font-medium text-warm-sand" scope="col">Source</th>
                      <th className="text-left p-3 text-sm font-medium text-warm-sand" scope="col">Messages</th>
                      <th className="w-16" scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => {
                      const cEvents = contactEvents(contact.id);
                      const cMsgs = contactMessages(contact.id);
                      const primaryEvent = cEvents[0];
                      return (
                        <tr
                          key={contact.id}
                          className="border-b border-warm-sand/10 hover:bg-warm-sand/5 transition-colors cursor-pointer"
                          onClick={() => { setSelectedContact(contact); setShowDetailPanel(true); }}
                        >
                          <td className="p-3">
                            <div>
                              <p className="text-warm-white font-medium text-sm">{contact.name}</p>
                              <p className="text-xs text-warm-sand">{contact.email || contact.phone || ""}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            {primaryEvent ? (
                              <span className="text-sm text-warm-white">{getEventTypeBadge(primaryEvent.type)}</span>
                            ) : <span className="text-sm text-warm-sand">-</span>}
                          </td>
                          <td className="p-3">
                            {primaryEvent ? (
                              <span className="text-sm text-warm-white">{formatShortDate(primaryEvent.date)}</span>
                            ) : <span className="text-sm text-warm-sand">-</span>}
                          </td>
                          <td className="p-3">
                            {contact.stage ? (
                              <Badge variant="default" className="text-[11px]">{contact.stage.name}</Badge>
                            ) : <span className="text-sm text-warm-sand">-</span>}
                          </td>
                          <td className="p-3 text-sm text-warm-sand capitalize">{SOURCE_LABELS[contact.source || ""] || contact.source || "-"}</td>
                          <td className="p-3">
                            <span className={`text-sm ${cMsgs.length > 0 ? "text-olive-gold font-medium" : "text-warm-sand"}`}>{cMsgs.length}</span>
                          </td>
                          <td className="p-3 relative">
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedContact(contact); setShowDetailPanel(true); }}
                                className="p-1.5 text-warm-sand hover:text-warm-white hover:bg-warm-sand/10 rounded transition-colors"
                                aria-label={`View ${contact.name} details`}
                              >
                                <User className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setMsgContactId(contact.id); setMsgType("email"); setMsgSubject(""); setMsgBody(""); setView("messages"); }}
                                className="p-1.5 text-warm-sand hover:text-warm-white hover:bg-warm-sand/10 rounded transition-colors"
                                aria-label={`Send message to ${contact.name}`}
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenRowMenu(openRowMenu === contact.id ? null : contact.id); }}
                                  className="p-1.5 text-warm-sand hover:text-warm-white hover:bg-warm-sand/10 rounded transition-colors"
                                  aria-label={`More actions for ${contact.name}`}
                                  aria-expanded={openRowMenu === contact.id}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                                {openRowMenu === contact.id && (
                                  <div
                                    ref={rowMenuRef}
                                    className="absolute right-0 top-full mt-1 z-50 w-44 bg-charcoal border border-warm-sand/20 rounded-lg shadow-xl py-1 animate-fade-in"
                                    role="menu"
                                  >
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setOpenRowMenu(null); setSelectedContact(contact); startEditing(contact); setShowDetailPanel(true); }}
                                      className="w-full text-left px-3 py-2 text-sm text-warm-white hover:bg-warm-sand/10 flex items-center gap-2"
                                      role="menuitem"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-warm-sand" /> Edit
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setOpenRowMenu(null); setMsgContactId(contact.id); setMsgType("email"); setMsgSubject(""); setMsgBody(""); setView("messages"); }}
                                      className="w-full text-left px-3 py-2 text-sm text-warm-white hover:bg-warm-sand/10 flex items-center gap-2"
                                      role="menuitem"
                                    >
                                      <Send className="w-3.5 h-3.5 text-warm-sand" /> Send Message
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setOpenRowMenu(null); setSelectedContact(contact); setShowDetailPanel(true); }}
                                      className="w-full text-left px-3 py-2 text-sm text-warm-white hover:bg-warm-sand/10 flex items-center gap-2"
                                      role="menuitem"
                                    >
                                      <Calendar className="w-3.5 h-3.5 text-warm-sand" /> View Events
                                    </button>
                                    <div className="border-t border-warm-sand/10 my-1" />
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setOpenRowMenu(null); setSelectedContact(contact); setShowDeleteConfirm(true); setShowDetailPanel(true); }}
                                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                      role="menuitem"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredContacts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-warm-sand">No contacts found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {view === "pipeline" && (
        <div>
          <div className="grid gap-3 grid-cols-3 mb-4">
            <Card className="bg-charcoal border-warm-sand/20">
              <CardContent className="p-3">
                <div className="rounded-lg bg-olive-gold/20 p-1.5 w-fit mb-1" aria-hidden="true"><DollarSign className="h-4 w-4 text-olive-gold" /></div>
                <p className="text-xs text-warm-sand">Pipeline Value</p>
                <p className="text-base font-bold text-warm-white">{formatCurrency(pipelineKpis?.["pipeline-value"]?.value || 0)}</p>
              </CardContent>
            </Card>
            <Card className="bg-charcoal border-warm-sand/20">
              <CardContent className="p-3">
                <div className="rounded-lg bg-olive-gold/20 p-1.5 w-fit mb-1" aria-hidden="true"><ArrowUpRight className="h-4 w-4 text-olive-gold" /></div>
                <p className="text-xs text-warm-sand">Conversion Rate</p>
                <p className="text-base font-bold text-warm-white">{pipelineKpis?.["conversion-rate"]?.value || 0}%</p>
              </CardContent>
            </Card>
            <Card className="bg-charcoal border-warm-sand/20">
              <CardContent className="p-3">
                <div className="rounded-lg bg-olive-gold/20 p-1.5 w-fit mb-1" aria-hidden="true"><Clock className="h-4 w-4 text-olive-gold" /></div>
                <p className="text-xs text-warm-sand">Sales Velocity</p>
                <p className="text-base font-bold text-warm-white">{pipelineKpis?.["sales-velocity"]?.value || 0} days</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageContacts = contacts.filter(c => c.stage_id === stage.id || (!c.stage_id && stage.order === 0));
              return (
                <div key={stage.id} className="flex-shrink-0 w-72 bg-charcoal border border-warm-sand/20 rounded-xl">
                  <div className="p-3 border-b rounded-t-xl" style={{ borderTopColor: stage.color, borderTopWidth: 3, backgroundColor: `${stage.color}10` }}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-warm-white text-sm">{stage.name}</h3>
                      <span className="text-xs text-warm-sand bg-warm-sand/20 px-2 py-0.5 rounded-full">{stageContacts.length}</span>
                    </div>
                  </div>
                  <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                    {stageContacts.map((contact) => {
                      const cEvents = contactEvents(contact.id);
                      const primaryEvent = cEvents[0];
                      const isUpdating = stageUpdating.has(contact.id);
                      return (
                        <div key={contact.id} className="p-3 bg-charcoal border border-warm-sand/10 rounded-lg hover:border-warm-sand/30 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-warm-white font-medium text-sm">{contact.name}</p>
                              {contact.company && <p className="text-xs text-warm-sand mt-0.5">{contact.company}</p>}
                            </div>
                            <div className="flex items-center gap-1">
                              {isUpdating && <Loader2 className="w-3 h-3 text-olive-gold animate-spin" />}
                              <select
                                value={contact.stage_id || ""}
                                onChange={(e) => handleStageChange(contact.id, e.target.value)}
                                disabled={isUpdating}
                                className="text-xs bg-charcoal border border-warm-sand/30 rounded px-1 py-0.5 text-warm-white cursor-pointer hover:border-olive-gold disabled:opacity-50"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Change stage for ${contact.name}`}
                              >
                                {stages.map((s) => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          {primaryEvent && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-warm-sand">
                              <Calendar className="w-3 h-3" aria-hidden="true" />
                              <span>{getEventTypeBadge(primaryEvent.type)} - {formatShortDate(primaryEvent.date)}</span>
                            </div>
                          )}
                          {primaryEvent && primaryEvent.total_price > 0 && (
                            <p className="text-xs text-olive-gold font-medium mt-1">{formatCurrency(primaryEvent.total_price)}</p>
                          )}
                          {contact.email && <p className="text-xs text-warm-sand mt-2 truncate">{contact.email}</p>}
                        </div>
                      );
                    })}
                    {stageContacts.length === 0 && <p className="p-4 text-center text-xs text-warm-sand">No contacts</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "messages" && (
        <div className="grid md:grid-cols-3 gap-0 border border-warm-sand/20 rounded-xl overflow-hidden min-h-[500px]">
          <div className="md:col-span-1 border-r border-warm-sand/20 bg-charcoal">
            <div className="p-3 border-b border-warm-sand/20">
              <h3 className="text-sm font-bold text-warm-white">Conversations</h3>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              {msgContactList.length > 0 ? (
                msgContactList.map(({ contact, lastMsg }) => (
                  <button
                    key={contact.id}
                    onClick={() => { setMsgContactId(contact.id); setMsgType("email"); setMsgSubject(""); setMsgBody(""); setMsgError(""); setMsgSuccess(false); }}
                    className={`w-full text-left p-3 border-b border-warm-sand/10 hover:bg-warm-sand/5 transition-colors ${msgContactId === contact.id ? "bg-olive-gold/10" : ""}`}
                    aria-label={`Conversation with ${contact.name}`}
                    aria-current={msgContactId === contact.id ? "true" : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-warm-white truncate">{contact.name}</p>
                      {lastMsg && <span className="text-[10px] text-warm-sand ml-2 shrink-0">{formatShortDate(lastMsg.created_at)}</span>}
                    </div>
                    {lastMsg ? (
                      <p className="text-xs text-warm-sand truncate mt-0.5">{lastMsg.type === "email" ? "Email" : "SMS"} &mdash; {lastMsg.body.slice(0, 60)}</p>
                    ) : (
                      <p className="text-xs text-warm-sand mt-0.5">No messages yet</p>
                    )}
                  </button>
                ))
              ) : (
                <p className="p-4 text-center text-xs text-warm-sand">No conversations</p>
              )}
            </div>
          </div>

          <div className="md:col-span-2 bg-charcoal flex flex-col">
            {msgContactId ? (
              <>
                <div className="p-3 border-b border-warm-sand/20 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-warm-white">{contacts.find(c => c.id === msgContactId)?.name || "Unknown"}</p>
                    <p className="text-xs text-warm-sand">{contacts.find(c => c.id === msgContactId)?.email || ""}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setMsgType("email")}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${msgType === "email" ? "bg-olive-gold text-charcoal font-medium" : "text-warm-sand hover:text-warm-white"}`}
                      aria-pressed={msgType === "email"}
                    >
                      <Mail className="w-3 h-3 inline mr-1" aria-hidden="true" />Email
                    </button>
                    <button
                      onClick={() => setMsgType("sms")}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${msgType === "sms" ? "bg-olive-gold text-charcoal font-medium" : "text-warm-sand hover:text-warm-white"}`}
                      aria-pressed={msgType === "sms"}
                    >
                      <MessageSquare className="w-3 h-3 inline mr-1" aria-hidden="true" />SMS
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[350px]">
                  {selectedMsgs.length > 0 ? (
                    [...selectedMsgs].reverse().map((m) => (
                      <div key={m.id} className={`p-3 rounded-lg max-w-[80%] ${m.type === "email" ? "bg-olive-gold/10 border border-olive-gold/20 ml-auto" : "bg-warm-sand/10 border border-warm-sand/20"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-medium text-warm-sand uppercase">{m.type === "email" ? "Email" : "SMS"}{m.subject ? ` - ${m.subject}` : ""}</span>
                          <span className="text-[10px] text-warm-sand">{formatShortDate(m.created_at)}</span>
                        </div>
                        <p className="text-sm text-warm-white whitespace-pre-wrap">{m.body}</p>
                        <p className="text-[10px] text-warm-sand mt-1">To: {m.recipient}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-warm-sand py-8">No messages yet. Send your first message below.</p>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-warm-sand/20 space-y-2">
                  {msgType === "email" && (
                    <Input
                      placeholder="Subject"
                      value={msgSubject}
                      onChange={(e) => setMsgSubject(e.target.value)}
                      aria-label="Email subject"
                    />
                  )}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={msgType === "email" ? "Write your email..." : "Write your SMS..."}
                      value={msgBody}
                      onChange={(e) => setMsgBody(e.target.value)}
                      className="min-h-[60px] text-sm flex-1"
                      aria-label={msgType === "email" ? "Email body" : "SMS body"}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={msgSending || !msgBody.trim()}
                      className="self-end shrink-0"
                      size="sm"
                      aria-label="Send message"
                    >
                      {msgSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                  {msgError && <p className="text-xs text-red-400" role="alert">{msgError}</p>}
                  {msgSuccess && <p className="text-xs text-green-400" role="status">Message sent!</p>}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full py-16">
                <div className="text-center">
                  <Mail className="w-8 h-8 text-warm-sand/40 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-sm text-warm-sand">Select a contact to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          onClick={() => { setShowAddLead(false); setLeadError(""); }}
          role="dialog"
          aria-modal="true"
          aria-label="Add new lead"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowAddLead(false); setLeadError(""); }} />
          <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-warm-white">Add New Lead</h2>
              <button onClick={() => { setShowAddLead(false); setLeadError(""); }} className="text-warm-sand hover:text-warm-white transition-colors" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLead} className="space-y-4">
              <Input label="Name *" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} placeholder="John Smith" required />
              <Input label="Email" type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="john@example.com" />
              <Input label="Phone" type="tel" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} placeholder="(555) 123-4567" />
              <Input label="Company" value={leadForm.company} onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} placeholder="Acme Inc." />
              <div>
                <label className="label">Role</label>
                <Select value={leadForm.role} onValueChange={(v) => setLeadForm({ ...leadForm, role: v })}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
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
                <Select value={leadForm.stage_id} onValueChange={(v) => setLeadForm({ ...leadForm, stage_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="label">Source</label>
                <Select value={leadForm.source} onValueChange={(v) => setLeadForm({ ...leadForm, source: v })}>
                  <SelectTrigger><SelectValue placeholder="How did they find you?" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SOURCE_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea label="Notes" value={leadForm.notes} onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })} placeholder="Any additional notes..." />
              {leadError && <p className="text-red-400 text-sm text-center" role="alert">{leadError}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => { setShowAddLead(false); setLeadError(""); }} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={addingLead || !leadForm.name} className="flex-1">{addingLead ? "Adding..." : "Add Lead"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailPanel && selectedContact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          onClick={() => { if (!showDeleteConfirm) setShowDetailPanel(false); }}
          role="dialog"
          aria-modal="true"
          aria-label={editingContact ? `Edit ${selectedContact.name}` : `${selectedContact.name} details`}
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => { if (!showDeleteConfirm) setShowDetailPanel(false); }} />
          <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-charcoal border-b border-warm-sand/20 p-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-section-title text-warm-white">{editingContact ? "Edit Contact" : selectedContact.name}</h2>
                {!editingContact && selectedContact.company && <p className="text-sm text-warm-sand">{selectedContact.company}</p>}
              </div>
              <div className="flex items-center gap-2">
                {!editingContact && (
                  <>
                    <button onClick={() => startEditing(selectedContact)} className="p-2 text-warm-sand hover:text-warm-white hover:bg-warm-sand/10 rounded-lg transition-colors" aria-label="Edit contact">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-warm-sand hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" aria-label="Delete contact">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button onClick={() => { setShowDetailPanel(false); setEditingContact(false); setShowDeleteConfirm(false); }} className="p-2 text-warm-sand hover:text-warm-white hover:bg-warm-sand/10 rounded-lg transition-colors" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {showDeleteConfirm ? (
              <div className="p-6 text-center">
                <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" aria-hidden="true" />
                <h3 className="text-lg font-bold text-warm-white mb-2">Delete {selectedContact.name}?</h3>
                <p className="text-sm text-warm-sand mb-6">This will permanently delete this contact and all associated data. This action cannot be undone.</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteContact}
                    disabled={deletingContact}
                    className="flex items-center gap-2"
                  >
                    {deletingContact ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {deletingContact ? "Deleting..." : "Delete"}
                  </Button>
                </div>
                {editError && <p className="text-red-400 text-sm text-center mt-3" role="alert">{editError}</p>}
              </div>
            ) : editingContact ? (
              <div className="p-4 space-y-4">
                <Input label="Name *" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                <Input label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                <Input label="Phone" type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                <Input label="Company" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
                <div>
                  <label className="label">Role</label>
                  <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
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
                  <label className="label">Source</label>
                  <Select value={editForm.source} onValueChange={(v) => setEditForm({ ...editForm, source: v })}>
                    <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SOURCE_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="label">Notes</label>
                  <Textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder="Any additional notes..." />
                </div>
                {editError && <p className="text-red-400 text-sm" role="alert">{editError}</p>}
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => { setEditingContact(false); setEditError(""); }} className="flex-1">Cancel</Button>
                  <Button onClick={handleEditSave} disabled={editSaving || !editForm.name} className="flex-1">
                    {editSaving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving...</> : "Save Changes"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-warm-sand font-medium uppercase tracking-wider">Contact Info</p>
                    <div className="mt-2 space-y-2">
                      {selectedContact.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-warm-sand shrink-0" aria-hidden="true" />
                          <a href={`mailto:${selectedContact.email}`} className="text-warm-white hover:text-olive-gold transition-colors">{selectedContact.email}</a>
                        </div>
                      )}
                      {selectedContact.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-warm-sand shrink-0" aria-hidden="true" />
                          <a href={`tel:${selectedContact.phone}`} className="text-warm-white hover:text-olive-gold transition-colors">{selectedContact.phone}</a>
                        </div>
                      )}
                      {selectedContact.role && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-warm-sand shrink-0" aria-hidden="true" />
                          <span className="text-warm-white capitalize">{selectedContact.role.replace(/_/g, " ")}</span>
                        </div>
                      )}
                      {selectedContact.source && (
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className="w-4 h-4 text-warm-sand shrink-0" aria-hidden="true" />
                          <span className="text-warm-white capitalize">{SOURCE_LABELS[selectedContact.source] || selectedContact.source}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-warm-sand font-medium uppercase tracking-wider">Pipeline</p>
                    <div className="mt-2 space-y-2">
                      {selectedContact.stage && <Badge variant="default" className="text-xs">{selectedContact.stage.name}</Badge>}
                      <p className="text-sm text-warm-sand">Added {formatDate(selectedContact.created_at)}</p>
                    </div>
                  </div>
                </div>

                {selectedContact.notes && (
                  <div>
                    <p className="text-xs text-warm-sand font-medium uppercase tracking-wider mb-2">Notes</p>
                    <p className="text-sm text-warm-white bg-warm-sand/5 rounded-lg p-3">{selectedContact.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-warm-sand font-medium uppercase tracking-wider mb-3">Events</p>
                  {contactEvents(selectedContact.id).length > 0 ? (
                    <div className="space-y-2">
                      {contactEvents(selectedContact.id).map((e) => (
                        <div key={e.id} className="flex items-center justify-between p-3 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
                          <div>
                            <p className="text-sm font-medium text-warm-white">{e.name}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-warm-sand">
                              <span>{getEventTypeBadge(e.type)}</span><span>|</span>
                              <Calendar className="w-3 h-3" aria-hidden="true" />
                              <span>{formatDate(e.date)}</span>
                              {e.venue_name && <><span>|</span><MapPin className="w-3 h-3" aria-hidden="true" /><span className="truncate">{e.venue_name}</span></>}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={EVENT_STATUS_BADGE[e.status] || "secondary"} className="text-[10px]">{e.status.replace(/_/g, " ")}</Badge>
                            {e.total_price > 0 && <p className="text-xs text-olive-gold font-medium mt-1">{formatCurrency(e.total_price)}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-warm-sand">No events associated with this contact</p>
                  )}
                </div>

                <div className="border-t border-warm-sand/10 pt-4">
                  <CommentsSection entityType="contact" entityId={selectedContact.id} />
                </div>

                <div>
                  <p className="text-xs text-warm-sand font-medium uppercase tracking-wider mb-3">Recent Messages</p>
                  {contactMessages(selectedContact.id).length > 0 ? (
                    <div className="space-y-2">
                      {contactMessages(selectedContact.id).slice(0, 5).map((m) => (
                        <div key={m.id} className="p-3 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium text-warm-sand uppercase">{m.type}{m.subject ? ` - ${m.subject}` : ""}</span>
                            <span className="text-[10px] text-warm-sand">{formatShortDate(m.created_at)}</span>
                          </div>
                          <p className="text-sm text-warm-white">{m.body.slice(0, 120)}{m.body.length > 120 ? "..." : ""}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-warm-sand">No messages yet</p>
                  )}
                  <div className="mt-3">
                    <Button size="sm" onClick={() => { setMsgContactId(selectedContact.id); setShowDetailPanel(false); setView("messages"); }} variant="secondary">
                      <Send className="w-3 h-3" aria-hidden="true" /> Send Message
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
