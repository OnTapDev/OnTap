"use client";

import { useState, useMemo } from "react";
import "react-day-picker/dist/style.css";
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, DollarSign, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives";

type Event = {
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

interface CalendarViewProps {
  events: Event[];
}

const VIEWS = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "list", label: "List" },
] as const;

export function CalendarView({ events }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "list">("month");

  const handleViewChange = (newView: "month" | "week" | "list") => {
    setView(newView);
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate));
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentMonth(new Date(date));
  };

  const eventDates = useMemo(() => events.map(e => new Date(e.date)), [events]);
  
  const selectedDateEvents = selectedDate
    ? events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.toDateString() === selectedDate.toDateString();
      })
    : [];

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    return events
      .filter(e => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [events]);

  const formatTime = (time: string | null) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const days = [];
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-charcoal rounded-lg p-1 border border-warm-sand/20">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => handleViewChange(v.id as typeof view)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === v.id
                  ? "bg-olive-gold text-charcoal"
                  : "text-warm-sand hover:text-warm-white"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newDate = new Date(currentMonth);
              if (view === "week") {
                newDate.setDate(newDate.getDate() - 7);
              } else {
                newDate.setMonth(newDate.getMonth() - 1);
              }
              setCurrentMonth(newDate);
            }}
            className="p-2 text-warm-sand hover:text-warm-white hover:bg-warm-sand/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-warm-white font-medium min-w-[180px] text-center">
            {view === "week" ? weekLabel : currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button
            onClick={() => {
              const newDate = new Date(currentMonth);
              if (view === "week") {
                newDate.setDate(newDate.getDate() + 7);
              } else {
                newDate.setMonth(newDate.getMonth() + 1);
              }
              setCurrentMonth(newDate);
            }}
            className="p-2 text-warm-sand hover:text-warm-white hover:bg-warm-sand/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {view === "list" ? (
        <Card className="bg-charcoal border-warm-sand/20">
          <CardHeader>
            <CardTitle className="text-warm-white">All Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-warm-sand/10">
              {events.length === 0 ? (
                <p className="text-warm-sand text-center py-12">No events found</p>
              ) : (
                events.map((event) => (
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
                        {event.status?.replace("_", " ") || "scheduled"}
                      </span>
                      <span className="text-warm-sand text-sm">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-charcoal border border-warm-sand/20 rounded-xl p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs text-warm-sand font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {(view === "week" ? weekDays : monthDays).map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }
                  
                  const isToday = day.toDateString() === today.toDateString();
                  const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                  const hasEvent = eventDates.some(e => e.toDateString() === day.toDateString());
                  const isPast = day < today && !isToday;
                  const dayEvents = events.filter(e => new Date(e.date).toDateString() === day.toDateString());
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDateSelect(day)}
                      disabled={isPast && !hasEvent}
                      className={`
                        aspect-square rounded-lg flex flex-col items-center justify-start pt-1 text-sm transition-all relative
                        ${isSelected 
                          ? "bg-olive-gold text-charcoal font-semibold" 
                          : isToday 
                            ? "border border-olive-gold text-olive-gold"
                            : isPast
                              ? "text-warm-sand/30 cursor-not-allowed"
                              : "text-warm-white hover:bg-warm-sand/10"
                        }
                      `}
                    >
                      <span className={view === "week" ? "text-xs" : ""}>{day.getDate()}</span>
                      {view === "week" && dayEvents.length > 0 && (
                        <div className="w-full px-1 mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((evt) => (
                            <div key={evt.id} className="text-xs truncate text-warm-sand bg-warm-sand/10 px-1 rounded">
                              {evt.name}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-warm-sand">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      )}
                      {view === "month" && hasEvent && !isSelected && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-olive-gold" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-warm-sand/10">
                <div className="flex items-center gap-2 text-xs text-warm-sand">
                  <div className="w-2 h-2 rounded-full bg-olive-gold" />
                  <span>Has Event</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-warm-sand">
                  <div className="w-2 h-2 rounded-full border border-olive-gold" />
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="bg-charcoal border-warm-sand/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-warm-white text-base">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                    : "Select a date"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length === 0 ? (
                  <p className="text-warm-sand text-sm py-4">No events scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 rounded-lg bg-warm-sand/5 border-l-4 border-olive-gold"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-warm-white font-medium text-sm">{event.name}</p>
                            <p className="text-xs text-warm-sand">{event.contact?.name}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status?.replace("_", " ") || "scheduled"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-warm-sand">
                          {event.start_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(event.start_time)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.guest_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {event.total_price.toLocaleString()}
                          </span>
                        </div>
                        {event.venue_name && (
                          <p className="text-xs text-warm-sand mt-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.venue_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-charcoal border-warm-sand/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-warm-white text-base">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-warm-sand text-sm py-4">No upcoming events</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleDateSelect(new Date(event.date))}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-warm-sand/5 transition-colors text-left"
                      >
                        <div>
                          <p className="text-warm-white text-sm font-medium">{event.name}</p>
                          <p className="text-xs text-warm-sand">{event.contact?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-warm-white text-sm">
                            {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                          <p className="text-xs text-warm-sand">{event.guest_count} guests</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}