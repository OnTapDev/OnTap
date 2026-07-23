"use client";

import { useState, useMemo } from "react";
import { Check, ChevronLeft, ChevronRight, Calendar, Clock, Users, MapPin, CheckCircle } from "lucide-react";
import { publicBookEvent } from "@/lib/public";

type Package = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  pricing_type: "per_guest" | "flat" | "hourly";
  min_guests: number | null;
  max_guests: number | null;
  includes_bartenders: number;
  includes_glassware: boolean;
  is_active: boolean;
};

interface PublicBookingFormProps {
  orgId: string;
  orgSlug: string;
  orgName: string;
  packages: Package[];
}

const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "birthday", label: "Birthday Party" },
  { value: "private_party", label: "Private Party" },
  { value: "festival", label: "Festival" },
  { value: "popup", label: "Popup" },
  { value: "other", label: "Other" },
];

function DatePicker({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value + "T00:00:00");
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const goToPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isPast = (day: number) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    return d <= today;
  };

  const isSelected = (day: number) => selectedDate?.getFullYear() === year && selectedDate?.getMonth() === month && selectedDate?.getDate() === day;

  const days = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(<div key={`prev-${i}`} className="text-warm-sand/20 text-sm py-1.5">{prevMonthDays - i}</div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const past = isPast(d);
    const selected = isSelected(d);
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    days.push(
      <button
        key={d}
        type="button"
        disabled={past}
        onClick={() => onChange(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`)}
        className={`text-sm py-1.5 rounded-lg transition-colors ${
          selected
            ? "bg-olive-gold text-charcoal font-bold"
            : isToday
              ? "text-olive-gold font-semibold hover:bg-olive-gold/20"
              : past
                ? "text-warm-sand/20 cursor-not-allowed"
                : "text-warm-white hover:bg-warm-sand/10"
        }`}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-3 select-none border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={goToPrevMonth} className="p-1 text-white/50 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-white">{monthNames[month]} {year}</span>
        <button type="button" onClick={goToNextMonth} className="p-1 text-white/50 hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0 text-center mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map(d => (
          <div key={d} className="text-xs text-white/50 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0 text-center">{days}</div>
    </div>
  );
}

export function PublicBookingForm({ orgId, orgSlug, orgName, packages }: PublicBookingFormProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("private_party");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [venueName, setVenueName] = useState("");
  const [notes, setNotes] = useState("");

  const [packageId, setPackageId] = useState("");
  const [submittedEventId, setSubmittedEventId] = useState("");

  const selectedPackage = packages.find(p => p.id === packageId);

  const pricing = useMemo(() => {
    if (!selectedPackage) return null;
    const guests = parseInt(guestCount) || 0;
    let pkgPrice = 0;
    if (selectedPackage.pricing_type === "per_guest") {
      pkgPrice = selectedPackage.base_price * guests;
    } else if (selectedPackage.pricing_type === "flat") {
      pkgPrice = selectedPackage.base_price;
    } else if (selectedPackage.pricing_type === "hourly") {
      pkgPrice = selectedPackage.base_price * 5;
    }
    const tax = pkgPrice * 0.0875;
    return { subtotal: pkgPrice, tax, total: pkgPrice + tax };
  }, [selectedPackage, guestCount]);

  const canSubmit = name && email && eventName && eventDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      const result = await publicBookEvent(orgSlug, {
        name,
        email,
        phone: phone || undefined,
        event_name: eventName,
        event_type: eventType,
        event_date: eventDate,
        guest_count: parseInt(guestCount) || 0,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        venue_name: venueName || undefined,
        notes: notes || undefined,
        package_id: packageId || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSubmittedEventId(result.event_id || "");
        setStep("success");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayDeposit = async () => {
    setDepositLoading(true);
    setDepositError("");
    try {
      const res = await fetch("/api/stripe/create-booking-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: submittedEventId, orgId, contactEmail: email, contactName: name }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setDepositError(data.error || "Failed to create deposit");
      }
    } catch {
      setDepositError("Something went wrong. Please try again.");
    } finally {
      setDepositLoading(false);
    }
  };

  if (step === "success") {
    const hasDeposit = !!packageId && !!pricing && pricing.total > 0;
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <div className="w-16 h-16 rounded-full bg-olive-gold/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-olive-gold" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Booking Received!</h2>
        <p className="text-white/70 mb-6">
          Thanks {name}! Your booking request has been sent to {orgName}. They will reach out to you shortly to confirm your event.
        </p>
        {hasDeposit && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6 text-left">
            <h3 className="text-white font-semibold mb-2">Secure Your Date</h3>
            <p className="text-sm text-white/60 mb-4">
              Pay a 25% deposit to guarantee your booking. Your deposit will be applied to the final total.
            </p>
            <div className="flex items-center justify-between text-sm text-white/60 mb-3">
              <span>Estimated total</span>
              <span className="text-white font-bold">${pricing!.total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/60 mb-4">
              <span>Deposit due (25%)</span>
              <span className="text-olive-gold font-bold">${Math.round(pricing!.total * 0.25).toLocaleString()}</span>
            </div>
            {depositError && <p className="text-sm text-red-400 mb-3">{depositError}</p>}
            <button
              onClick={handlePayDeposit}
              disabled={depositLoading}
              className="w-full h-12 bg-olive-gold text-charcoal font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {depositLoading ? "Redirecting to payment..." : `Pay Deposit — $${Math.round(pricing!.total * 0.25).toLocaleString()}`}
            </button>
            <p className="text-xs text-white/30 mt-3 text-center">Payments are processed securely via Stripe. You can also pay later.</p>
          </div>
        )}
        <p className="text-sm text-white/50">
          Reference ID: <span className="text-olive-gold font-mono">{submittedEventId.slice(0, 8)}</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Book {orgName}</h1>
        <p className="text-white/70">Fill in the details below and we&apos;ll get back to you promptly.</p>
      </div>

      {/* Contact Info */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-olive-gold text-charcoal text-sm font-bold flex items-center justify-center shrink-0">1</span>
          Your Contact Info
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-base text-white placeholder:text-white/30 focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
              className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-base text-white placeholder:text-white/30 focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold transition-colors"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-white/80 mb-1.5">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-base text-white placeholder:text-white/30 focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-olive-gold text-charcoal text-sm font-bold flex items-center justify-center shrink-0">2</span>
          Event Details
        </h2>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">Event Name *</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Our Wedding Reception"
            required
            className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-base text-white placeholder:text-white/30 focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold transition-colors"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Event Type *</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-base text-white focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold transition-colors"
            >
              {eventTypes.map(t => (
                <option key={t.value} value={t.value} className="bg-[#1a1a1a]">{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Estimated Guests</label>
            <input
              type="number"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              placeholder="100"
              min="1"
              className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-base text-white placeholder:text-white/30 focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">Preferred Date *</label>
          <DatePicker value={eventDate} onChange={setEventDate} />
          {eventDate && (
            <p className="text-xs text-olive-gold mt-1">
              {new Date(eventDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-base text-white focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-base text-white focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">Venue Name</label>
          <input
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder="Where is the event?"
            className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-base text-white placeholder:text-white/30 focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests..."
            rows={3}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold transition-colors resize-none"
          />
        </div>
      </div>

      {/* Package Selection */}
      {packages.length > 0 && (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-olive-gold text-charcoal text-sm font-bold flex items-center justify-center shrink-0">3</span>
            Choose a Package
          </h2>
          <p className="text-sm text-white/50">Select a package or skip — we can discuss options later.</p>
          <div className="grid gap-3">
            {packages.map(pkg => {
              const isSelected = packageId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setPackageId(isSelected ? "" : pkg.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected ? "border-olive-gold bg-olive-gold/10" : "border-white/10 hover:border-white/30 bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold">{pkg.name}</h3>
                        {isSelected && <Check className="w-4 h-4 text-olive-gold shrink-0" />}
                      </div>
                      {pkg.description && <p className="text-sm text-white/60 mt-1 line-clamp-2">{pkg.description}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs text-white/50 bg-white/5 px-2 py-0.5 rounded">
                          {pkg.includes_bartenders} bartender{pkg.includes_bartenders !== 1 ? "s" : ""}
                        </span>
                        {pkg.includes_glassware && (
                          <span className="text-xs text-white/50 bg-white/5 px-2 py-0.5 rounded">Glassware</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className={`text-lg font-bold ${isSelected ? "text-olive-gold" : "text-white"}`}>${pkg.base_price}</p>
                      <p className="text-xs text-white/50">
                        {pkg.pricing_type === "per_guest" ? "/guest" : pkg.pricing_type === "flat" ? "flat" : "/hr"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedPackage && pricing && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between text-sm text-white/60 mb-1">
                <span>Estimated subtotal</span>
                <span className="text-white">${pricing.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-white/60 mb-1">
                <span>Estimated tax</span>
                <span className="text-white">${pricing.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
                <span>Estimated total</span>
                <span className="text-olive-gold">${pricing.total.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="w-full h-14 bg-olive-gold text-charcoal font-bold rounded-xl text-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        {loading ? "Submitting..." : "Send Booking Request"}
      </button>

      <p className="text-center text-xs text-white/30 pb-8">
        By submitting, you agree to be contacted by {orgName} regarding your event.
      </p>
    </form>
  );
}
