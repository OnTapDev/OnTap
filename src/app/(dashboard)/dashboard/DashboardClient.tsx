"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives";
import {
  Users, DollarSign, Calendar, ArrowUpRight, Mail, ChevronLeft, ChevronRight,
  Clock, MapPin, UserPlus, FileText, Package, AlertTriangle, CheckCircle2,
  BarChart3, FileSignature, Receipt, Settings, HelpCircle, User, Target,
  Wine
} from "lucide-react";
import { MiniLineChart } from "@/ui/components/MiniLineChart";
import Link from "next/link";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  created_at: string;
};

type Event = {
  id: string;
  name: string;
  date: string;
  status: string;
  guest_count: number;
};

type CalendarEvent = {
  id: string;
  name: string;
  type: string;
  date: string;
  start_time: string | null;
  venue_name: string | null;
  guest_count: number;
  status: string;
  total_price: number;
  contact: { name: string } | null;
};

type KPI = {
  value: number;
  change: string;
  chartData: number[];
};

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorder_level: number | null;
};

type Organization = {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  default_hourly_rate: number | null;
  service_area: string | null;
};

type AdditionalData = {
  pendingQuotes: number;
  signedContracts: number;
  lowStockItems: number;
  pendingContracts: number;
  staffCount: number;
  todayEvents: number;
  thisWeekEvents: number;
  totalContacts: number;
};

interface DashboardClientProps {
  initialContacts: Contact[];
  initialEvents: Event[];
  calendarEvents: CalendarEvent[];
  kpis: {
    leads: KPI;
    revenue: KPI;
    events: KPI;
    conversion: KPI;
  };
  additionalData: AdditionalData;
  organization: Organization | null;
  inventoryItems: InventoryItem[];
}

const toolLinks = [
  { name: "Profile", href: "/profile", icon: User, desc: "Business info & setup" },
  { name: "CRM", href: "/crm", icon: Target, desc: "Manage leads & contacts" },
  { name: "Calendar", href: "/calendar", icon: Calendar, desc: "View schedule" },
  { name: "Events", href: "/events", icon: Wine, desc: "Manage events" },
  { name: "Quotes", href: "/quotes", icon: FileText, desc: "Send quotes" },
  { name: "Contracts", href: "/contracts", icon: FileSignature, desc: "Contracts" },
  { name: "Invoices", href: "/invoices", icon: Receipt, desc: "Billing" },
  { name: "Staff", href: "/staff", icon: Users, desc: "Manage team" },
  { name: "Settings", href: "/settings", icon: Settings, desc: "Preferences" },
  { name: "Support", href: "/support", icon: HelpCircle, desc: "Get help" },
];

const quickActions = [
  { name: "New Contact", href: "/crm", icon: UserPlus, color: "bg-olive-gold/20 text-olive-gold" },
  { name: "New Event", href: "/events", icon: Calendar, color: "bg-olive-gold/20 text-olive-gold" },
  { name: "New Quote", href: "/quotes", icon: FileText, color: "bg-olive-gold/20 text-olive-gold" },
  { name: "View Calendar", href: "/calendar", icon: BarChart3, color: "bg-olive-gold/20 text-olive-gold" },
];

const VIEWS = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Recent Activity" },
  { id: "calendar", label: "Calendar" },
] as const;

export function DashboardClient({
  initialContacts, initialEvents, calendarEvents, kpis,
  additionalData, organization, inventoryItems
}: DashboardClientProps) {
  const [view, setView] = useState<"overview" | "activity" | "calendar">("overview");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "week" | "list">("month");

  const lowStockItems = inventoryItems.filter(
    item => item.reorder_level !== null && item.quantity <= item.reorder_level
  );

  const profileComplete = useMemo(() => {
    if (!organization) return 0;
    let score = 0;
    if (organization.name) score += 20;
    if (organization.description) score += 20;
    if (organization.phone || organization.email) score += 20;
    if (organization.logo_url) score += 20;
    if (organization.city) score += 20;
    return score;
  }, [organization]);

  const filteredContacts = initialContacts.filter(c =>
    c.name.toLowerCase().includes("") || c.email?.toLowerCase().includes("")
  );

  const recentContacts = filteredContacts.slice(0, 5);
  const upcomingEvents = initialEvents.slice(0, 5);

  const eventDates = useMemo(() => calendarEvents.map(e => new Date(e.date)), [calendarEvents]);

  const selectedDateEvents = selectedDate
    ? calendarEvents.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.toDateString() === selectedDate.toDateString();
      })
    : [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new_inquiry: "bg-warm-sand/20 border-warm-sand text-warm-sand",
      quoted: "bg-olive-gold/20 border-olive-gold text-olive-gold",
      tentative: "bg-yellow-500/20 border-yellow-500 text-yellow-400",
      booked: "bg-olive-gold/20 border-olive-gold text-olive-gold",
      deposit_paid: "bg-green-500/20 border-green-500 text-green-400",
      completed: "bg-gray-500/20 border-gray-500 text-gray-400",
      cancelled: "bg-red-500/20 border-red-500 text-red-400",
    };
    return colors[status] || "bg-warm-sand/20 border-warm-sand text-warm-sand";
  };

  const formatTime = (time: string | null) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${minutes} ${ampm}`;
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const getWeekDays = (date: Date) => {
    const days: Date[] = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const monthDays = getMonthDays(currentMonth);
  const weekDays = getWeekDays(currentMonth);
  const today = new Date();

  const weekLabel = useMemo(() => {
    if (weekDays.length === 0) return "";
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
  }, [weekDays]);

  const stats = [
    { name: "Active Leads", value: kpis.leads.value.toString(), change: kpis.leads.change,
      icon: Users, chartData: kpis.leads.chartData, description: "Leads from last 30 days", href: "/crm" },
    { name: "Revenue MTD", value: `$${kpis.revenue.value.toLocaleString()}`, change: kpis.revenue.change,
      icon: DollarSign, chartData: kpis.revenue.chartData, description: "Revenue from paid invoices", href: "/billing" },
    { name: "Upcoming Events", value: kpis.events.value.toString(), change: kpis.events.change,
      icon: Calendar, chartData: kpis.events.chartData, description: "Events in next 30 days", href: "/events" },
    { name: "Pending Quotes", value: additionalData.pendingQuotes.toString(), change: `${additionalData.signedContracts} signed`,
      icon: FileText, chartData: kpis.conversion.chartData, description: "Quotes awaiting response", href: "/quotes" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-screen-title text-warm-white">
            {organization?.name ? `${organization.name}` : "Dashboard"}
          </h1>
          <p className="text-warm-sand mt-1">
            {additionalData.todayEvents > 0
              ? `You have ${additionalData.todayEvents} event${additionalData.todayEvents > 1 ? "s" : ""} today`
              : additionalData.thisWeekEvents > 0
                ? `${additionalData.thisWeekEvents} event${additionalData.thisWeekEvents > 1 ? "s" : ""} this week`
                : "All systems operational"}
          </p>
        </div>
      </div>

      {profileComplete < 100 && (
        <div className="bg-olive-gold/10 border border-olive-gold/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-olive-gold" />
            <div>
              <p className="text-warm-white text-sm font-medium">Complete your business profile</p>
              <p className="text-warm-sand text-xs">{profileComplete}% complete — add details to get listed in the marketplace</p>
            </div>
          </div>
          <Link href="/profile" className="text-xs px-3 py-1.5 bg-olive-gold text-charcoal rounded-lg hover:bg-olive-gold/90 transition-colors font-medium">
            Complete Profile
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {quickActions.map(action => (
          <Link key={action.name} href={action.href}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-warm-sand/20 hover:border-warm-sand/40 transition-colors bg-charcoal">
            <div className={`p-1.5 rounded-lg ${action.color}`}>
              <action.icon className="w-4 h-4" />
            </div>
            <span className="text-sm text-warm-white font-medium">{action.name}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-charcoal rounded-lg p-1 w-fit border border-warm-sand/20">
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setView(v.id as typeof view)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === v.id ? "bg-olive-gold text-charcoal" : "text-warm-sand hover:text-warm-white"
            }`}>{v.label}</button>
        ))}
      </div>

      {view === "overview" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map(stat => (
              <Link key={stat.name} href={stat.href}>
                <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="rounded-lg bg-olive-gold/20 p-3">
                        <stat.icon className="h-6 w-6 text-olive-gold" />
                      </div>
                      <MiniLineChart data={stat.chartData} color="#7D7254" />
                    </div>
                    <p className="text-meta text-warm-sand">{stat.name}</p>
                    <div className="flex items-end justify-between mt-2">
                      <p className="text-3xl font-bold text-warm-white">{stat.value}</p>
                      <div className="flex items-center gap-1 text-sm text-olive-gold">
                        <ArrowUpRight className="w-4 h-4" /><span>{stat.change}</span>
                      </div>
                    </div>
                    <p className="text-xs text-warm-sand/60 mt-2">{stat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-charcoal border-warm-sand/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-warm-white">Upcoming Events</CardTitle>
                <Link href="/events" className="text-sm text-olive-gold hover:text-warm-white">View all</Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                    <div key={event.id} className="flex items-center justify-between py-3 border-b border-warm-sand/10 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-olive-gold/20 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-olive-gold" />
                        </div>
                        <div>
                          <p className="text-warm-white font-medium">{event.name}</p>
                          <p className="text-sm text-warm-sand">{event.date} · {event.guest_count} guests</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        event.status === "booked" || event.status === "deposit_paid"
                          ? "bg-green-500/20 text-green-400"
                          : event.status === "tentative"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : event.status === "cancelled"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-olive-gold/20 text-olive-gold"
                      }`}>
                        {event.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Calendar className="w-10 h-10 text-warm-sand/30 mx-auto mb-3" />
                      <p className="text-warm-sand">No upcoming events</p>
                      <Link href="/events" className="text-sm text-olive-gold hover:text-warm-white mt-2 inline-block">Create your first event</Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-charcoal border-warm-sand/20">
              <CardHeader>
                <CardTitle className="text-warm-white">Pipeline Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "New Inquiries", count: additionalData.totalContacts, icon: Users },
                    { label: "Pending Quotes", count: additionalData.pendingQuotes, icon: FileText },
                    { label: "Contracts to Sign", count: additionalData.pendingContracts, icon: FileSignature },
                    { label: "Signed Contracts", count: additionalData.signedContracts, icon: CheckCircle2 },
                    { label: "This Week Events", count: additionalData.thisWeekEvents, icon: Calendar },
                    { label: "Total Events", count: kpis.events.value, icon: Calendar },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-olive-gold/20 text-olive-gold">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-warm-sand text-sm">{item.label}</span>
                      </div>
                      <span className="text-warm-white font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-charcoal border-warm-sand/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-warm-white">Inventory Alerts</CardTitle>
                <Link href="/profile" className="text-sm text-olive-gold hover:text-warm-white">Manage</Link>
              </CardHeader>
              <CardContent>
                {lowStockItems.length > 0 ? (
                  <div className="space-y-3">
                    {lowStockItems.slice(0, 5).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-warm-sand/5 rounded-lg border border-red-500/20">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-red-500/20">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          </div>
                          <div>
                            <p className="text-warm-white text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-warm-sand">{item.quantity} {item.unit} remaining (reorder at {item.reorder_level})</p>
                          </div>
                        </div>
                        <span className="text-xs text-red-400 font-medium">Low Stock</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-10 h-10 text-warm-sand/30 mx-auto mb-3" />
                    <p className="text-warm-sand">No low stock alerts</p>
                    <p className="text-xs text-warm-sand/60 mt-1">All inventory levels are healthy</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-charcoal border-warm-sand/20">
              <CardHeader>
                <CardTitle className="text-warm-white">Quick Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {toolLinks.map(tool => (
                    <Link key={tool.name} href={tool.href}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-warm-sand/5 hover:bg-warm-sand/10 border border-warm-sand/10 hover:border-warm-sand/30 transition-all">
                      <tool.icon className="w-5 h-5 text-olive-gold" />
                      <span className="text-xs text-warm-white font-medium">{tool.name}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/10 text-center">
              <p className="text-2xl font-bold text-olive-gold">{additionalData.totalContacts}</p>
              <p className="text-xs text-warm-sand">Total Contacts</p>
            </div>
            <div className="p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/10 text-center">
              <p className="text-2xl font-bold text-olive-gold">{additionalData.signedContracts}</p>
              <p className="text-xs text-warm-sand">Signed Contracts</p>
            </div>
            <div className="p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/10 text-center">
              <p className="text-2xl font-bold text-olive-gold">{inventoryItems.length}</p>
              <p className="text-xs text-warm-sand">Inventory Items</p>
            </div>
            <div className="p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/10 text-center">
              <p className="text-2xl font-bold text-olive-gold">{additionalData.staffCount}</p>
              <p className="text-xs text-warm-sand">Staff Assignments</p>
            </div>
          </div>
        </>
      )}

      {view === "activity" && (
        <Card className="bg-charcoal border-warm-sand/20">
          <CardHeader><CardTitle className="text-warm-white">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentContacts.length > 0 ? recentContacts.slice(0, 10).map(contact => (
                <div key={contact.id} className="flex items-start gap-4 py-4 border-b border-warm-sand/10 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-olive-gold/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-olive-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-warm-white font-medium">{contact.name}</p>
                    <p className="text-sm text-warm-sand">{contact.email}</p>
                    <p className="text-xs text-warm-sand/60 mt-1">{new Date(contact.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-full bg-olive-gold/20 px-3 py-1 text-xs font-medium text-olive-gold">New Lead</span>
                </div>
              )) : (
                <p className="text-warm-sand text-center py-8">No recent activity yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {view === "calendar" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-charcoal rounded-lg p-1 border border-warm-sand/20">
              {(["month", "week", "list"] as const).map(v => (
                <button key={v} onClick={() => setCalendarView(v)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    calendarView === v ? "bg-olive-gold text-charcoal" : "text-warm-sand hover:text-warm-white"
                  }`}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => {
                const d = new Date(currentMonth);
                if (calendarView === "week") d.setDate(d.getDate() - 7);
                else d.setMonth(d.getMonth() - 1);
                setCurrentMonth(d); setSelectedDate(new Date(d));
              }} className="p-2 text-warm-sand hover:text-warm-white hover:bg-warm-sand/10 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
              <span className="text-warm-white font-medium min-w-[180px] text-center">
                {calendarView === "week" ? weekLabel : currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button onClick={() => {
                const d = new Date(currentMonth);
                if (calendarView === "week") d.setDate(d.getDate() + 7);
                else d.setMonth(d.getMonth() + 1);
                setCurrentMonth(d); setSelectedDate(new Date(d));
              }} className="p-2 text-warm-sand hover:text-warm-white hover:bg-warm-sand/10 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>

          {calendarView === "list" ? (
            <Card className="bg-charcoal border-warm-sand/20">
              <CardContent className="p-0">
                <div className="divide-y divide-warm-sand/10">
                  {calendarEvents.length === 0 ? (
                    <p className="text-warm-sand text-center py-12">No events found</p>
                  ) : calendarEvents.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-4 hover:bg-warm-sand/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-olive-gold/20 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-olive-gold" />
                        </div>
                        <div>
                          <p className="text-warm-white font-medium">{event.name}</p>
                          <p className="text-sm text-warm-sand">{event.contact?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                          {event.status?.replace(/_/g, " ")}
                        </span>
                        <span className="text-warm-sand text-sm">
                          {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-charcoal border border-warm-sand/20 rounded-xl p-4">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs text-warm-sand font-medium py-2">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {(calendarView === "week" ? weekDays : monthDays).map((day, index) => {
                      if (!day) return <div key={`e-${index}`} className="aspect-square" />;
                      const isToday = day.toDateString() === today.toDateString();
                      const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                      const hasEvent = eventDates.some(e => e.toDateString() === day.toDateString());
                      const isPast = day < today && !isToday;
                      const dayEvents = calendarEvents.filter(e => new Date(e.date).toDateString() === day.toDateString());
                      return (
                        <button key={day.toISOString()} onClick={() => { setSelectedDate(day); setCurrentMonth(new Date(day)); }}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-start pt-1 text-sm transition-all relative
                            ${isSelected ? "bg-olive-gold text-charcoal font-semibold"
                              : isToday ? "border border-olive-gold text-olive-gold"
                                : isPast ? "text-warm-sand/30 cursor-not-allowed"
                                  : "text-warm-white hover:bg-warm-sand/10"}`}>
                          <span>{day.getDate()}</span>
                          {calendarView === "week" && dayEvents.length > 0 && (
                            <div className="w-full px-1 mt-1 space-y-1">
                              {dayEvents.slice(0, 2).map(evt => (
                                <div key={evt.id} className="text-xs truncate text-warm-sand bg-warm-sand/10 px-1 rounded">{evt.name}</div>
                              ))}
                              {dayEvents.length > 2 && <div className="text-xs text-warm-sand">+{dayEvents.length - 2} more</div>}
                            </div>
                          )}
                          {calendarView === "month" && hasEvent && !isSelected && (
                            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-olive-gold" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-warm-sand/10">
                    <div className="flex items-center gap-2 text-xs text-warm-sand"><div className="w-2 h-2 rounded-full bg-olive-gold" /><span>Has Event</span></div>
                    <div className="flex items-center gap-2 text-xs text-warm-sand"><div className="w-2 h-2 rounded-full border border-olive-gold" /><span>Today</span></div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Card className="bg-charcoal border-warm-sand/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-warm-white text-base">
                      {selectedDate ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Select a date"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDateEvents.length === 0 ? (
                      <p className="text-warm-sand text-sm py-4">No events scheduled</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedDateEvents.map(event => (
                          <div key={event.id} className="p-3 rounded-lg bg-warm-sand/5 border-l-4 border-olive-gold">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-warm-white font-medium text-sm">{event.name}</p>
                                <p className="text-xs text-warm-sand">{event.contact?.name}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                                {event.status?.replace(/_/g, " ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-warm-sand">
                              {event.start_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(event.start_time)}</span>}
                              <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{event.total_price.toLocaleString()}</span>
                            </div>
                            {event.venue_name && (
                              <p className="text-xs text-warm-sand mt-2 flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue_name}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
