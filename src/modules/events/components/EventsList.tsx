"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, MoreHorizontal, Clock, Phone, Mail, MessageSquare, Send } from "lucide-react";
import { getMessages } from "@/modules/crm/actions/messaging";
import { MessagePanel } from "@/modules/crm/components/MessagePanel";

type Event = {
  id: string;
  name: string;
  type: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
  guest_count: number | null;
  status: string;
  total_price: number | null;
  deposit_amount: number | null;
  balance_due: number | null;
  contact: { id: string; name: string; phone: string | null; email: string | null } | null;
  notes: string | null;
  created_at: string;
};

type Message = {
  id: string;
  type: "email" | "sms";
  subject: string | null;
  body: string;
  status: string;
  recipient: string;
  created_at: string;
};

interface EventsListProps {
  events: Event[];
  orgId: string;
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

const eventTypeLabels: Record<string, string> = {
  wedding: "Wedding",
  corporate: "Corporate Event",
  birthday: "Birthday Party",
  private_party: "Private Party",
  festival: "Festival",
  popup: "Popup",
  other: "Other",
};

export function EventsList({ events, orgId }: EventsListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showMessagePanel, setShowMessagePanel] = useState(false);

  useEffect(() => {
    if (selectedEvent?.contact?.id) {
      setLoadingMessages(true);
      setShowMessages(false);
      getMessages(selectedEvent.contact.id).then((data) => {
        setMessages(data as Message[]);
        setLoadingMessages(false);
      });
    } else {
      setMessages([]);
    }
  }, [selectedEvent]);

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
              onClick={() => setSelectedEvent(event)}
              className="bg-charcoal border border-warm-sand/20 rounded-xl p-4 hover:border-warm-sand/40 transition-colors cursor-pointer"
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
                  ${event.total_price?.toLocaleString() || "0"}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                  className="p-1.5 text-warm-sand hover:text-warm-white"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-warm-white">{selectedEvent.name}</h2>
                <p className="text-sm text-warm-sand mt-1">{selectedEvent.contact?.name || "No contact"}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusColors[selectedEvent.status]?.bg || "bg-warm-sand/20"
              } ${
                statusColors[selectedEvent.status]?.text || "text-warm-sand"
              }`}>
                {selectedEvent.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-warm-sand/5 rounded-lg p-3">
                  <p className="text-xs text-warm-sand mb-1">Type</p>
                  <p className="text-warm-white text-sm font-medium">
                    {eventTypeLabels[selectedEvent.type] || selectedEvent.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
                <div className="bg-warm-sand/5 rounded-lg p-3">
                  <p className="text-xs text-warm-sand mb-1">Date</p>
                  <p className="text-warm-white text-sm font-medium">
                    {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {selectedEvent.start_time && (
                <div className="bg-warm-sand/5 rounded-lg p-3">
                  <p className="text-xs text-warm-sand mb-1">Time</p>
                  <p className="text-warm-white text-sm font-medium">
                    {selectedEvent.start_time}{selectedEvent.end_time && ` - ${selectedEvent.end_time}`}
                  </p>
                </div>
              )}

              {selectedEvent.venue_name && (
                <div className="bg-warm-sand/5 rounded-lg p-3">
                  <p className="text-xs text-warm-sand mb-1">Venue</p>
                  <p className="text-warm-white text-sm font-medium">{selectedEvent.venue_name}</p>
                  {selectedEvent.venue_address && (
                    <p className="text-warm-sand text-xs mt-1">{selectedEvent.venue_address}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-warm-sand/5 rounded-lg p-3">
                  <p className="text-xs text-warm-sand mb-1">Guests</p>
                  <p className="text-warm-white text-sm font-medium">{selectedEvent.guest_count ?? "—"}</p>
                </div>
                <div className="bg-warm-sand/5 rounded-lg p-3">
                  <p className="text-xs text-warm-sand mb-1">Total Price</p>
                  <p className="text-warm-white text-sm font-medium">${selectedEvent.total_price?.toLocaleString() || "0"}</p>
                </div>
              </div>

              {selectedEvent.deposit_amount != null && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-warm-sand/5 rounded-lg p-3">
                    <p className="text-xs text-warm-sand mb-1">Deposit Paid</p>
                    <p className="text-warm-white text-sm font-medium">${selectedEvent.deposit_amount.toLocaleString()}</p>
                  </div>
                  {selectedEvent.balance_due != null && (
                    <div className="bg-warm-sand/5 rounded-lg p-3">
                      <p className="text-xs text-warm-sand mb-1">Balance Due</p>
                      <p className="text-warm-white text-sm font-medium">${selectedEvent.balance_due.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedEvent.contact?.phone && (
                <div className="bg-warm-sand/5 rounded-lg p-3 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-warm-sand shrink-0" />
                  <p className="text-warm-white text-sm">{selectedEvent.contact.phone}</p>
                </div>
              )}

              {selectedEvent.contact?.email && (
                <div className="bg-warm-sand/5 rounded-lg p-3 flex items-center gap-3">
                  <Mail className="w-4 h-4 text-warm-sand shrink-0" />
                  <p className="text-warm-white text-sm">{selectedEvent.contact.email}</p>
                </div>
              )}

              {selectedEvent.notes && (
                <div className="bg-warm-sand/5 rounded-lg p-3">
                  <p className="text-xs text-warm-sand mb-1">Notes</p>
                  <p className="text-warm-white text-sm whitespace-pre-wrap">{selectedEvent.notes}</p>
                </div>
              )}
            </div>

            {selectedEvent.contact?.id && (
              <>
                <button
                  onClick={() => setShowMessages(!showMessages)}
                  className="mt-4 w-full flex items-center justify-between px-4 py-2 bg-warm-sand/5 hover:bg-warm-sand/10 rounded-lg text-sm text-warm-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-warm-sand" />
                    <span>Message History ({messages.length})</span>
                  </div>
                  <span className="text-warm-sand text-xs">{showMessages ? "▲" : "▼"}</span>
                </button>

                {showMessages && (
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {loadingMessages ? (
                      <p className="text-warm-sand text-sm text-center py-4">Loading messages...</p>
                    ) : messages.length === 0 ? (
                      <p className="text-warm-sand text-sm text-center py-4">No messages yet</p>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className="bg-warm-sand/5 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {msg.type === "email" ? (
                                <Mail className="w-3.5 h-3.5 text-warm-sand" />
                              ) : (
                                <MessageSquare className="w-3.5 h-3.5 text-warm-sand" />
                              )}
                              <span className="text-xs text-olive-gold font-medium uppercase">
                                {msg.type}
                              </span>
                            </div>
                            <span className="text-xs text-warm-sand">
                              {new Date(msg.created_at).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {msg.subject && (
                            <p className="text-xs text-warm-sand mb-1">Subject: {msg.subject}</p>
                          )}
                          <p className="text-sm text-warm-white line-clamp-2">{msg.body}</p>
                          <p className="text-xs text-warm-sand mt-1">To: {msg.recipient}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <button
                  onClick={() => setShowMessagePanel(true)}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-olive-gold/20 hover:bg-olive-gold/30 text-olive-gold rounded-lg text-sm font-medium transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </>
            )}

            <div className="mt-4 pt-4 border-t border-warm-sand/10">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-2 bg-warm-sand/10 hover:bg-warm-sand/20 text-warm-white rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>

            {showMessagePanel && selectedEvent.contact && (
              <MessagePanel
                contact={{
                  id: selectedEvent.contact.id,
                  name: selectedEvent.contact.name,
                  email: selectedEvent.contact.email,
                  phone: selectedEvent.contact.phone,
                }}
                onClose={() => setShowMessagePanel(false)}
                orgId={orgId}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
