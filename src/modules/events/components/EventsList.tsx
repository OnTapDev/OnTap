"use client";

import { useState } from "react";
import { Calendar, MapPin, Users, MoreHorizontal, Clock } from "lucide-react";

type Event = {
  id: string;
  name: string;
  type: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
  guest_count: number;
  status: string;
  total_price: number;
  contact: { name: string } | null;
  created_at: string;
};

interface EventsListProps {
  events: Event[];
}

const statusColors: Record<string, { bg: string; text: string }> = {
  new_inquiry: { bg: "bg-warm-sand/20", text: "text-warm-sand" },
  quoted: { bg: "bg-blue-500/20", text: "text-blue-400" },
  tentative: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  booked: { bg: "bg-olive-gold/20", text: "text-olive-gold" },
  deposit_paid: { bg: "bg-green-500/20", text: "text-green-400" },
  completed: { bg: "bg-gray-500/20", text: "text-gray-400" },
  cancelled: { bg: "bg-red-500/20", text: "text-red-400" },
};

export function EventsList({ events }: EventsListProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredEvents = filter === "all" 
    ? events 
    : events.filter(e => e.status === filter);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === "all"
              ? "bg-olive-gold text-charcoal"
              : "text-warm-sand hover:text-warm-white bg-warm-sand/10"
          }`}
        >
          All ({events.length})
        </button>
        {Object.keys(statusColors).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? "bg-olive-gold text-charcoal"
                : "text-warm-sand hover:text-warm-white bg-warm-sand/10"
            }`}
          >
            {formatStatus(status)} ({events.filter(e => e.status === status).length})
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full p-8 text-center text-warm-sand bg-charcoal border border-warm-sand/20 rounded-xl">
            No events found. Add your first event to get started.
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-charcoal border border-warm-sand/20 rounded-xl p-4 hover:border-warm-sand/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-warm-white font-medium">{event.name}</h3>
                  <p className="text-sm text-warm-sand">
                    {event.contact?.name || "No contact"}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusColors[event.status]?.bg || "bg-warm-sand/20"
                  } ${
                    statusColors[event.status]?.text || "text-warm-sand"
                  }`}
                >
                  {formatStatus(event.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-warm-sand">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(event.date)}</span>
                </div>
                
                {event.start_time && (
                  <div className="flex items-center gap-2 text-warm-sand">
                    <Clock className="w-4 h-4" />
                    <span>
                      {event.start_time}
                      {event.end_time && ` - ${event.end_time}`}
                    </span>
                  </div>
                )}

                {event.venue_name && (
                  <div className="flex items-center gap-2 text-warm-sand">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{event.venue_name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-warm-sand">
                  <Users className="w-4 h-4" />
                  <span>{event.guest_count} guests</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-warm-sand/10">
                <span className="text-warm-white font-medium">
                  ${event.total_price.toLocaleString()}
                </span>
                <button className="p-1.5 text-warm-sand hover:text-warm-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
