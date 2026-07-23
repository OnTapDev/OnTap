"use client";

import { useState, useMemo } from "react";
import { Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives";
import { createEvent } from "@/modules/events/actions/events";
import { createQuote } from "@/modules/quotes/actions/quotes";
import { createContact } from "@/modules/crm/actions/contacts";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

type Contact = { id: string; name: string; email?: string | null; phone?: string | null };

type Package_ = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  pricing_type: "per_guest" | "flat" | "hourly";
  min_guests: number | null;
  max_guests: number | null;
  includes_bartenders: number;
  includes_glassware: boolean;
};

interface BookingModalProps {
  contacts: Contact[];
  packages: Package_[];
  orgId: string;
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

const availableAddOns = [
  { id: "signature_cocktails", name: "Signature Cocktails", price: 150 },
  { id: "glassware_upgrade", name: "Premium Glassware", price: 200 },
  { id: "smoke_gun", name: "Smoke Gun", price: 175 },
  { id: "nitrogen", name: "Nitrogen Cocktails", price: 125 },
  { id: "coffee_bar", name: "Coffee Bar", price: 250 },
  { id: "mocktail_station", name: "Mocktail Station", price: 150 },
];

const TAX_RATE = 0.0875;

const STEPS = [
  { num: 1, label: "Contact" },
  { num: 2, label: "Event" },
  { num: 3, label: "Package" },
  { num: 4, label: "Review" },
];

function DatePicker({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value + "T00:00:00");
    return new Date(today);
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
    return d < today;
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
    <div className="bg-warm-sand/5 rounded-lg p-3 select-none border border-warm-sand/10">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={goToPrevMonth} className="p-1 text-warm-sand hover:text-warm-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-warm-white">{monthNames[month]} {year}</span>
        <button type="button" onClick={goToNextMonth} className="p-1 text-warm-sand hover:text-warm-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0 text-center mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map(d => (
          <div key={d} className="text-xs text-warm-sand font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0 text-center">
        {days}
      </div>
    </div>
  );
}

export function BookingModal({ contacts, packages, orgId }: BookingModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [contactId, setContactId] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", phone: "" });

  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [notes, setNotes] = useState("");

  const [packageId, setPackageId] = useState("");
  const [addOns, setAddOns] = useState<string[]>([]);

  const selectedPackage = packages.find(p => p.id === packageId);

  const pricing = useMemo(() => {
    if (!selectedPackage) return { subtotal: 0, tax: 0, total: 0 };
    const guests = parseInt(guestCount) || 0;
    let pkgPrice = 0;
    if (selectedPackage.pricing_type === "per_guest") {
      pkgPrice = selectedPackage.base_price * guests;
    } else if (selectedPackage.pricing_type === "flat") {
      pkgPrice = selectedPackage.base_price;
    } else if (selectedPackage.pricing_type === "hourly") {
      pkgPrice = selectedPackage.base_price * 5;
    }
    const addOnsTotal = addOns.reduce((sum, id) => {
      const a = availableAddOns.find(x => x.id === id);
      return sum + (a?.price || 0);
    }, 0);
    const subtotal = pkgPrice + addOnsTotal;
    return { subtotal, tax: subtotal * TAX_RATE, total: subtotal * (1 + TAX_RATE) };
  }, [selectedPackage, guestCount, addOns]);

  const canProceed = useMemo(() => {
    if (step === 1) return showAddContact ? !!newContact.name : !!contactId;
    if (step === 2) return !!eventName && !!eventType && !!eventDate;
    return true;
  }, [step, showAddContact, newContact.name, contactId, eventName, eventType, eventDate]);

  const resetForm = () => {
    setStep(1);
    setContactId(""); setShowAddContact(false); setNewContact({ name: "", email: "", phone: "" });
    setEventName(""); setEventType(""); setEventDate(""); setStartTime(""); setEndTime("");
    setVenueName(""); setVenueAddress(""); setGuestCount(""); setNotes("");
    setPackageId(""); setAddOns([]); setError("");
  };

  const toggleAddOn = (id: string) => setAddOns(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      let resolvedContactId = contactId;
      if (showAddContact) {
        const created = await createContact(orgId, {
          name: newContact.name,
          email: newContact.email || undefined,
          phone: newContact.phone || undefined,
        });
        resolvedContactId = created.id;
      }

      const actualGuestCount = parseInt(guestCount) || 0;
      const event = await createEvent(orgId, {
        contact_id: resolvedContactId,
        name: eventName,
        type: eventType,
        date: eventDate,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        venue_name: venueName || undefined,
        venue_address: venueAddress || undefined,
        guest_count: actualGuestCount,
        notes: notes || undefined,
      });

      if (packageId) {
        const addOnsObj = addOns.reduce((acc, id) => {
          const a = availableAddOns.find(x => x.id === id);
          if (a) acc[id] = a.price;
          return acc;
        }, {} as Record<string, number>);

        await createQuote(orgId, {
          contact_id: resolvedContactId,
          event_id: event.id,
          package_id: packageId,
          guest_count: actualGuestCount,
          add_ons: addOnsObj,
          subtotal: pricing.subtotal,
          tax: pricing.tax,
          total: pricing.total,
          status: "draft",
        });
      }

      resetForm();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Add Event
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => { resetForm(); setOpen(false); }} />
          <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">

            <div className="p-6 pb-0">
              <h2 className="text-xl font-bold text-warm-white mb-6">New Booking</h2>

              <div className="flex items-center justify-center gap-0 mb-6">
                {STEPS.map((s, i) => (
                  <div key={s.num} className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                        step > s.num ? "bg-olive-gold text-charcoal" : step === s.num ? "bg-olive-gold text-charcoal" : "bg-warm-sand/20 text-warm-sand"
                      }`}>
                        {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                      </div>
                      <span className={`text-sm font-medium hidden sm:inline ${step >= s.num ? "text-warm-white" : "text-warm-sand"}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-10 sm:w-16 h-0.5 mx-1 sm:mx-2 ${step > s.num ? "bg-olive-gold" : "bg-warm-sand/20"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 pt-0">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-warm-white">Select Contact</h3>
                  {!showAddContact ? (
                    <>
                      <div>
                        <label className="label">Contact *</label>
                        <Select value={contactId} onValueChange={setContactId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a contact..." />
                          </SelectTrigger>
                          <SelectContent>
                            {contacts.map(c => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}{c.email ? ` — ${c.email}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <button type="button" onClick={() => setShowAddContact(true)} className="text-sm text-olive-gold hover:underline">
                        + Add new contact
                      </button>
                    </>
                  ) : (
                    <div className="space-y-4 bg-warm-sand/5 rounded-lg p-4 border border-warm-sand/10">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-warm-white">New Contact</h4>
                        <button type="button" onClick={() => setShowAddContact(false)} className="text-sm text-warm-sand hover:text-warm-white">
                          Pick existing
                        </button>
                      </div>
                      <Input label="Name *" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} placeholder="John Doe" />
                      <Input label="Email" type="email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} placeholder="john@example.com" />
                      <Input label="Phone" type="tel" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} placeholder="(555) 123-4567" />
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-warm-white">Event Details</h3>
                  <Input label="Event Name *" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Smith Wedding" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Event Type *</label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {eventTypes.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input label="Guest Count" type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} placeholder="150" />
                  </div>
                  <div>
                    <label className="label">Date *</label>
                    <DatePicker value={eventDate} onChange={setEventDate} />
                    {eventDate && (
                      <p className="text-xs text-olive-gold mt-1">
                        {new Date(eventDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    <Input label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                  <Input label="Venue Name" value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="The Grand Ballroom" />
                  <Input label="Venue Address" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="123 Main St, City" />
                  <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requirements..." />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-warm-white">Package &amp; Pricing</h3>
                  <p className="text-sm text-warm-sand">Select a package or skip to create a basic event.</p>
                  {packages.length === 0 ? (
                    <div className="p-6 text-center text-warm-sand bg-warm-sand/5 rounded-lg border border-warm-sand/10">
                      No packages available. You can continue without one.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {packages.map(pkg => {
                        const isSelected = packageId === pkg.id;
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setPackageId(isSelected ? "" : pkg.id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                              isSelected ? "border-olive-gold bg-olive-gold/10" : "border-warm-sand/20 hover:border-warm-sand/40 bg-charcoal"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-warm-white font-bold">{pkg.name}</h4>
                                  {isSelected && <Check className="w-4 h-4 text-olive-gold shrink-0" />}
                                </div>
                                {pkg.description && <p className="text-sm text-warm-sand mt-1 line-clamp-2">{pkg.description}</p>}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="text-xs text-warm-sand bg-warm-sand/10 px-2 py-0.5 rounded">
                                    {pkg.includes_bartenders} bartender{pkg.includes_bartenders !== 1 ? "s" : ""}
                                  </span>
                                  {pkg.includes_glassware && (
                                    <span className="text-xs text-warm-sand bg-warm-sand/10 px-2 py-0.5 rounded">Glassware</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right ml-4 shrink-0">
                                <p className={`text-lg font-bold ${isSelected ? "text-olive-gold" : "text-warm-white"}`}>${pkg.base_price}</p>
                                <p className="text-xs text-warm-sand">
                                  {pkg.pricing_type === "per_guest" ? "/guest" : pkg.pricing_type === "flat" ? "flat" : "/hr"}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {packageId && (
                    <>
                      <div className="bg-warm-sand/5 rounded-lg p-4 border border-warm-sand/10 space-y-2">
                        <h4 className="text-sm font-bold text-warm-white">Package Pricing</h4>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-warm-sand">Rate</span>
                          <span className="text-warm-white font-medium">
                            {selectedPackage?.pricing_type === "per_guest"
                              ? `$${selectedPackage.base_price} × ${parseInt(guestCount) || 0} guests`
                              : selectedPackage?.pricing_type === "flat"
                                ? `$${selectedPackage.base_price} flat`
                                : selectedPackage ? `$${selectedPackage.base_price}/hr × 5 hrs` : ""}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="label">Add-ons</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {availableAddOns.map(addOn => (
                            <button
                              key={addOn.id}
                              type="button"
                              onClick={() => toggleAddOn(addOn.id)}
                              className={`p-3 rounded-lg border text-left transition-colors ${
                                addOns.includes(addOn.id) ? "border-olive-gold bg-olive-gold/20" : "border-warm-sand/20 hover:border-warm-sand/40"
                              }`}
                            >
                              <p className="text-sm text-warm-white">{addOn.name}</p>
                              <p className="text-xs text-warm-sand">+${addOn.price}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-warm-sand/10 rounded-lg p-4">
                        <div className="flex justify-between text-sm text-warm-sand mb-1">
                          <span>Subtotal</span>
                          <span>${pricing.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-warm-sand mb-1">
                          <span>Tax (8.75%)</span>
                          <span>${pricing.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-warm-white font-bold pt-2 border-t border-warm-sand/20">
                          <span>Total</span>
                          <span>${pricing.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-warm-white">Review &amp; Confirm</h3>
                  <div className="space-y-3">
                    <div className="bg-warm-sand/5 rounded-lg p-4 border border-warm-sand/10">
                      <h4 className="text-sm font-bold text-warm-white mb-2">Contact</h4>
                      <p className="text-sm text-warm-white">
                        {showAddContact ? newContact.name : contacts.find(c => c.id === contactId)?.name}
                      </p>
                      {showAddContact && newContact.email && (
                        <p className="text-xs text-warm-sand mt-1">{newContact.email}</p>
                      )}
                    </div>
                    <div className="bg-warm-sand/5 rounded-lg p-4 border border-warm-sand/10">
                      <h4 className="text-sm font-bold text-warm-white mb-3">Event</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-warm-sand">Name</p>
                          <p className="text-sm text-warm-white">{eventName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-warm-sand">Type</p>
                          <p className="text-sm text-warm-white">{eventTypes.find(t => t.value === eventType)?.label || eventType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-warm-sand">Date</p>
                          <p className="text-sm text-warm-white">
                            {new Date(eventDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-warm-sand">Guests</p>
                          <p className="text-sm text-warm-white">{parseInt(guestCount) || 0}</p>
                        </div>
                        {startTime && (
                          <div>
                            <p className="text-xs text-warm-sand">Time</p>
                            <p className="text-sm text-warm-white">{startTime}{endTime ? ` - ${endTime}` : ""}</p>
                          </div>
                        )}
                        {venueName && (
                          <div>
                            <p className="text-xs text-warm-sand">Venue</p>
                            <p className="text-sm text-warm-white">{venueName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {packageId && selectedPackage ? (
                      <div className="bg-warm-sand/5 rounded-lg p-4 border border-warm-sand/10">
                        <h4 className="text-sm font-bold text-warm-white mb-2">Package</h4>
                        <p className="text-sm text-warm-white">{selectedPackage.name}</p>
                        {addOns.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {addOns.map(id => {
                              const a = availableAddOns.find(x => x.id === id);
                              return a ? (
                                <span key={id} className="text-xs bg-olive-gold/10 text-olive-gold px-2 py-0.5 rounded">{a.name}</span>
                              ) : null;
                            })}
                          </div>
                        )}
                        <div className="bg-warm-sand/10 rounded-lg p-3 mt-3">
                          <div className="flex justify-between text-sm text-warm-sand mb-1">
                            <span>Subtotal</span>
                            <span>${pricing.subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm text-warm-sand mb-1">
                            <span>Tax (8.75%)</span>
                            <span>${pricing.tax.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-warm-white font-bold pt-2 border-t border-warm-sand/20">
                            <span>Total</span>
                            <span>${pricing.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-warm-sand/5 rounded-lg p-4 border border-warm-sand/10">
                        <p className="text-sm text-warm-sand">No package selected. Event will be created without pricing.</p>
                      </div>
                    )}
                  </div>
                  {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3">{error}</p>}
                </div>
              )}

              <div className="flex justify-between mt-8 pt-6 border-t border-warm-sand/10">
                <div>
                  {step > 1 ? (
                    <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>
                  ) : (
                    <Button type="button" variant="secondary" onClick={() => { resetForm(); setOpen(false); }}>Cancel</Button>
                  )}
                </div>
                <div>
                  {step < 4 ? (
                    <Button type="button" disabled={!canProceed} onClick={() => setStep(step + 1)}>Continue</Button>
                  ) : (
                    <Button type="button" disabled={loading} onClick={handleSubmit}>
                      {loading ? "Booking..." : "Confirm &amp; Book"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
