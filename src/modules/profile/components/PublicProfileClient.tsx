"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, Button } from "@/ui/primitives";
import { submitInquiry } from "@/modules/profile/actions/inquiry";
import { MapPin, Phone, Mail, Globe, Calendar, Clock, Check, GlassWater, Beer, Wine, Coffee, Send, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  default_hourly_rate: number | null;
  minimum_booking_hours: number | null;
  service_area: string | null;
};

const _EVENT_TYPES = [
  { value: "wedding", label: "Wedding Reception" },
  { value: "corporate", label: "Corporate Event" },
  { value: "birthday", label: "Birthday Party" },
  { value: "private_party", label: "Private Party" },
  { value: "anniversary", label: "Anniversary" },
  { value: "holiday", label: "Holiday Party" },
  { value: "fundraiser", label: "Fundraiser" },
  { value: "other", label: "Other" },
];

const DRINK_PREFERENCES = [
  { value: "full_bar", label: "Full Bar (Cocktails, Beer, Wine)" },
  { value: "cocktails", label: "Signature Cocktails Only" },
  { value: "beer_wine", label: "Beer & Wine Only" },
  { value: "non_alcoholic", label: "Non-Alcoholic / Mocktails" },
];

const BAR_TYPES = [
  { value: "full_service", label: "Full Service", description: "We provide alcohol, drinks, and bar" },
  { value: "dry_hire", label: "Dry Hire", description: "You provide the alcohol, we supply bar & staff" },
];

const _HEARD_FROM = [
  { value: "google", label: "Google Search" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "referral", label: "Friend / Referral" },
  { value: "knot", label: "The Knot / Wedding Wire" },
  { value: "gigsalad", label: "GigSalad" },
  { value: "other", label: "Other" },
];

const TIME_SLOTS = [
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"
];

function CalendarPicker({ selectedDates, onSelectDate, multi = false }: { selectedDates: string[]; onSelectDate: (dates: string[]) => void; multi?: boolean }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = today.toISOString().split('T')[0];

  const isPast = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dateStr < todayStr;
  };

  const handleSelect = (dateStr: string) => {
    if (multi) {
      if (selectedDates.includes(dateStr)) {
        onSelectDate(selectedDates.filter(d => d !== dateStr));
      } else {
        onSelectDate([...selectedDates, dateStr]);
      }
    } else {
      onSelectDate([dateStr]);
    }
  };

  const isSelected = (dateStr: string) => selectedDates.includes(dateStr);

  return (
    <div className="bg-charcoal rounded-lg p-4 border border-warm-sand/20">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-warm-sand/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-warm-sand" />
        </button>
        <span className="text-warm-white font-semibold">{monthName}</span>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-warm-sand/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-warm-sand" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-xs text-warm-sand">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, i) => {
          if (!date) return <div key={i} />;
          const dateStr = date.toISOString().split('T')[0];
          const selected = isSelected(dateStr);
          const past = isPast(date);
          
          return (
            <button
              key={i}
              disabled={past}
              onClick={() => handleSelect(dateStr)}
              className={`p-2 rounded-lg text-sm transition-all ${
                selected 
                  ? 'bg-olive-gold text-charcoal font-semibold' 
                  : past 
                    ? 'text-warm-sand/30 cursor-not-allowed'
                    : 'text-warm-white hover:bg-warm-sand/20'
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      {multi && selectedDates.length > 0 && (
        <div className="mt-3 pt-3 border-t border-warm-sand/10">
          <p className="text-xs text-warm-sand mb-2">Selected: {selectedDates.length} day(s)</p>
          <div className="flex flex-wrap gap-1">
            {selectedDates.sort().map((d, i) => (
              <span key={i} className="bg-olive-gold/20 text-olive-gold px-2 py-1 rounded text-xs">
                {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ))}
          </div>
          <button 
            onClick={() => onSelectDate([])}
            className="text-xs text-warm-sand hover:text-warm-white mt-2"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function TimeSlotPicker({ selectedStart, selectedEnd, onSelect }: { 
  selectedStart: string; 
  selectedEnd: string; 
  onSelect: (start: string, end: string) => void;
}) {
  const _startIdx = TIME_SLOTS.indexOf(selectedStart);
  const _endIdx = TIME_SLOTS.indexOf(selectedEnd);
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-warm-sand mb-2 block">Start Time</label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {TIME_SLOTS.map((time) => (
              <button
                key={time}
                onClick={() => onSelect(time, selectedEnd)}
                className={`p-2 rounded-lg text-sm transition-all ${
                  selectedStart === time
                    ? 'bg-olive-gold text-charcoal'
                    : 'bg-warm-sand/10 text-warm-white hover:bg-warm-sand/20'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm text-warm-sand mb-2 block">End Time</label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {TIME_SLOTS.map((time) => {
              const startIdx = TIME_SLOTS.indexOf(selectedStart);
              const endIdx = TIME_SLOTS.indexOf(time);
              const isValid = endIdx > startIdx;
              
              return (
                <button
                  key={time}
                  disabled={!isValid}
                  onClick={() => onSelect(selectedStart, time)}
                  className={`p-2 rounded-lg text-sm transition-all ${
                    selectedEnd === time
                      ? 'bg-olive-gold text-charcoal'
                      : !isValid
                        ? 'bg-warm-sand/5 text-warm-sand/30 cursor-not-allowed'
                        : 'bg-warm-sand/10 text-warm-white hover:bg-warm-sand/20'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {selectedStart && selectedEnd && (
        <div className="mt-2 p-2 bg-olive-gold/10 rounded-lg text-center text-olive-gold text-sm">
          Service hours: {selectedStart} - {selectedEnd}
        </div>
      )}
    </div>
  );
}

type Package = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  pricing_type: string;
  min_guests: number | null;
  max_guests: number | null;
  includes_bartenders: number | null;
  includes_glassware: boolean | null;
  is_active: boolean | null;
};

type GalleryItem = {
  id: string;
  url: string;
  type: string;
  caption: string | null;
};

interface PublicProfileClientProps {
  organization: Organization;
  packages: Package[];
  galleryItems: GalleryItem[];
}

export function PublicProfileClient({ organization, packages, galleryItems }: PublicProfileClientProps) {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showPackages, setShowPackages] = useState(true);
  const [_bookingStep, _setBookingStep] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [emailForm, setEmailForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [emailSent, setEmailSent] = useState(false);
  const [booking, setBooking] = useState({
    name: "",
    email: "",
    phone: "",
    event_type: "",
    dates: [] as string[],
    start_time: "",
    end_time: "",
    guest_count: "",
    venue_name: "",
    venue_address: "",
    drink_preference: "",
    bar_type: "full_service",
    bar_setup: "onsite",
    dietary_notes: "",
    heard_from: "",
  });

  const publicGallery = galleryItems.filter(g => g.type === "image").slice(0, 6);
  const publicPackages = packages.filter(p => p.is_active !== false);

  const handleSubmitBooking = async () => {
    if (!booking.name || !booking.email || booking.dates.length === 0 || !booking.guest_count || !booking.venue_name) {
      alert("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    const selectedPkg = publicPackages.find(p => p.id === selectedPackage);
    const drinkPrefLabel = DRINK_PREFERENCES.find(d => d.value === booking.drink_preference)?.label;
    const barTypeLabel = BAR_TYPES.find(b => b.value === booking.bar_type)?.label;
    const datesLabel = booking.dates.sort().join(", ");
    
    try {
      await submitInquiry(organization.slug, {
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        event_type: selectedPkg?.name || "Custom Event",
        date: booking.dates[0],
        guest_count: booking.guest_count ? parseInt(booking.guest_count) : undefined,
        venue_name: booking.venue_name || undefined,
        notes: `Bar Type: ${barTypeLabel}\nDates: ${datesLabel}\nTime: ${booking.start_time} – ${booking.end_time}\nGuests: ${booking.guest_count}\nVenue: ${booking.venue_name}\nAddress: ${booking.venue_address}\nDrink Preference: ${drinkPrefLabel || "N/A"}\nNotes: ${booking.dietary_notes}`,
      });
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          {organization.logo_url ? (
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={organization.logo_url}
                alt={organization.name}
                fill
                className="object-contain rounded-xl"
              />
            </div>
          ) : (
            <div className="w-32 h-32 mx-auto mb-4 bg-olive-gold/20 rounded-xl flex items-center justify-center">
              <span className="text-4xl font-bold text-olive-gold">
                {organization.name.charAt(0)}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-warm-white mb-2">{organization.name}</h1>
          {organization.description && (
            <p className="text-warm-sand max-w-xl mx-auto">{organization.description}</p>
          )}
        </div>

<div className="mb-8">
          {showBooking ? (
            <Card className="bg-charcoal border-warm-sand/20 overflow-hidden">
              <div className="bg-charcoal p-6 border-b border-warm-sand/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-warm-white">
                {selectedPackage 
                  ? publicPackages.find(p => p.id === selectedPackage)?.name 
                  : "Request a Quote"}
              </h3>
                  <button 
                    onClick={() => { setShowBooking(false); setSelectedPackage(null); setBooking({...booking, dates: [], start_time: "", end_time: "", guest_count: "", venue_name: "", venue_address: "", drink_preference: "", name: "", email: "", phone: ""}); setShowPackages(true); }}
                    className="text-warm-sand hover:text-warm-white p-2 rounded-lg hover:bg-warm-sand/10 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-center gap-3 mb-6">
                  {publicPackages.length > 0 && (
                    <>
                      {!showPackages ? (
                        <button 
                          onClick={() => { setShowPackages(true); }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-warm-sand/30 bg-charcoal hover:border-olive-gold hover:bg-olive-gold/10 transition-all"
                        >
                          <span className="text-warm-white text-sm">View packages</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => { setSelectedPackage(null); setShowPackages(false); }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-warm-sand/30 bg-charcoal hover:border-olive-gold hover:bg-olive-gold/10 transition-all"
                        >
                          <span className="text-warm-white text-sm">Skip — Custom quote</span>
                        </button>
                      )}
                    </>
                  )}
                </div>

                {showPackages && publicPackages.length > 0 && (
                  <div>
                    <div className="grid gap-4">
                      {publicPackages.map((pkg) => {
                        const isSelected = selectedPackage === pkg.id;
                        const guestRange = pkg.min_guests && pkg.max_guests 
                          ? `${pkg.min_guests}–${pkg.max_guests} guests` 
                          : pkg.min_guests 
                            ? `${pkg.min_guests}+ guests` 
                            : "Unlimited guests";
                        
                        return (
                          <button
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg.id)}
                            className={`w-full p-4 rounded-xl border text-left transition-all duration-300 ${
                              isSelected
                                ? "border-olive-gold bg-olive-gold/10 shadow-lg shadow-olive-gold/20 ring-1 ring-olive-gold/50" 
                                : "border-warm-sand/20 hover:border-warm-sand/60 hover:bg-warm-sand/5"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  isSelected 
                                    ? "border-olive-gold bg-olive-gold" 
                                    : "border-warm-sand/50"
                                }`}>
                                  {isSelected && <Check className="w-4 h-4 text-charcoal" />}
                                </div>
                                <div>
                                  <p className="font-bold text-lg text-warm-white">{pkg.name}</p>
                                  <p className="text-sm text-warm-sand">{pkg.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-olive-gold">
                                  ${pkg.base_price}
                                  <span className="text-sm font-normal text-warm-sand">
                                    {pkg.pricing_type === "per_guest" ? "/guest" : pkg.pricing_type === "hourly" ? "/hr" : ""}
                                  </span>
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 text-sm bg-charcoal/50 rounded-lg p-3">
                              <div>
                                <span className="text-warm-sand/70 text-xs">Guests</span>
                                <p className="text-warm-white font-medium">{guestRange}</p>
                              </div>
                              <div>
                                <span className="text-warm-sand/70 text-xs">Bartenders</span>
                                <p className="text-warm-white font-medium">{pkg.includes_bartenders || 1}</p>
                              </div>
                              <div>
                                <span className="text-warm-sand/70 text-xs">Glassware</span>
                                <p className="text-warm-white font-medium">{pkg.includes_glassware ? "Included" : "Not included"}</p>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-warm-sand/10">
                              <p className="text-xs text-warm-sand/70 mb-1">Additional fees may apply:</p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="bg-warm-sand/10 px-2 py-1 rounded text-warm-sand">
                                  Extra guests: ${Math.round(pkg.base_price * 0.15)}/ea
                                </span>
                                <span className="bg-warm-sand/10 px-2 py-1 rounded text-warm-sand">
                                  +$50/hr per extra hour
                                </span>
                                {!pkg.includes_glassware && (
                                  <span className="bg-warm-sand/10 px-2 py-1 rounded text-warm-sand">
                                    Glassware: $3/guest
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-warm-sand text-sm mb-2 block">Event Date *</label>
                    <button
                      onClick={() => setCalendarOpen(!calendarOpen)}
                      className="w-full p-3 rounded-lg border border-warm-sand/30 bg-charcoal hover:border-olive-gold transition-colors flex items-center gap-3 text-left"
                    >
                      <Calendar className="w-5 h-5 text-olive-gold flex-shrink-0" />
                      <span className={booking.dates.length > 0 ? "text-warm-white" : "text-warm-sand/50"}>
                        {booking.dates.length > 0 
                        ? booking.dates.sort().map(d => 
                          new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                        ).join(", ")
                        : "Select date(s)"}
                      </span>
                    </button>
                    {calendarOpen && (
                      <div className="mt-2">
                        <CalendarPicker 
                          selectedDates={booking.dates} 
                          onSelectDate={(dates) => {
                            setBooking({...booking, dates, start_time: "", end_time: ""});
                            if (dates.length > 0) setCalendarOpen(false);
                          }} 
                          multi={true}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-warm-sand text-sm mb-2 block">Service Time</label>
                    <button
                      onClick={() => booking.dates.length > 0 && setTimePickerOpen(!timePickerOpen)}
                      disabled={booking.dates.length === 0}
                      className="w-full p-3 rounded-lg border border-warm-sand/30 bg-charcoal hover:border-olive-gold transition-colors flex items-center gap-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Clock className="w-5 h-5 text-olive-gold flex-shrink-0" />
                      <span className={booking.start_time ? "text-warm-white" : "text-warm-sand/50"}>
                        {booking.start_time && booking.end_time 
                          ? `${booking.start_time} – ${booking.end_time}` 
                          : booking.dates.length > 0 ? "Select time range" : "Select date first"}
                      </span>
                    </button>
                    {timePickerOpen && booking.dates.length > 0 && (
                      <div className="mt-2">
                        <TimeSlotPicker 
                          selectedStart={booking.start_time}
                          selectedEnd={booking.end_time}
                          onSelect={(start, end) => {
                            setBooking({...booking, start_time: start, end_time: end});
                            setTimePickerOpen(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    placeholder="Your Name *"
                    value={booking.name}
                    onChange={(e) => setBooking({...booking, name: e.target.value})}
                    className="md:col-span-1 flex h-12 w-full rounded-lg border border-warm-sand/30 bg-charcoal px-4 py-3 text-base text-warm-white placeholder:text-warm-sand/50"
                    required
                  />
                  <input
                    placeholder="Email *"
                    type="email"
                    value={booking.email}
                    onChange={(e) => setBooking({...booking, email: e.target.value})}
                    className="md:col-span-1 flex h-12 w-full rounded-lg border border-warm-sand/30 bg-charcoal px-4 py-3 text-base text-warm-white placeholder:text-warm-sand/50"
                    required
                  />
                  <input
                    placeholder="Phone *"
                    type="tel"
                    value={booking.phone}
                    onChange={(e) => setBooking({...booking, phone: e.target.value})}
                    className="md:col-span-1 flex h-12 w-full rounded-lg border border-warm-sand/30 bg-charcoal px-4 py-3 text-base text-warm-white placeholder:text-warm-sand/50"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    placeholder="Number of Guests (21+) *"
                    type="number"
                    value={booking.guest_count}
                    onChange={(e) => setBooking({...booking, guest_count: e.target.value})}
                    className="flex h-12 w-full rounded-lg border border-warm-sand/30 bg-charcoal px-4 py-3 text-base text-warm-white placeholder:text-warm-sand/50"
                    required
                  />
                  <input
                    placeholder="Venue Name *"
                    value={booking.venue_name}
                    onChange={(e) => setBooking({...booking, venue_name: e.target.value})}
                    className="flex h-12 w-full rounded-lg border border-warm-sand/30 bg-charcoal px-4 py-3 text-base text-warm-white placeholder:text-warm-sand/50"
                    required
                  />
                </div>
                <input
                  placeholder="Venue Address *"
                  value={booking.venue_address}
                  onChange={(e) => setBooking({...booking, venue_address: e.target.value})}
                  className="flex h-12 w-full rounded-lg border border-warm-sand/30 bg-charcoal px-4 py-3 text-base text-warm-white placeholder:text-warm-sand/50"
                  required
                />

                <div>
                  <label className="text-warm-sand text-sm mb-3 block">Bar Service Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {BAR_TYPES.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setBooking({...booking, bar_type: opt.value})}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          booking.bar_type === opt.value
                            ? 'border-olive-gold bg-olive-gold/10 shadow-lg shadow-olive-gold/10'
                            : 'border-warm-sand/20 hover:border-warm-sand/50 hover:scale-[1.02]'
                        }`}
                      >
                        <p className="font-semibold text-warm-white">{opt.label}</p>
                        <p className="text-sm text-warm-sand">{opt.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {booking.bar_type === "full_service" && (
                  <div>
                    <label className="text-warm-sand text-sm mb-3 block">Drink Preference</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DRINK_PREFERENCES.map((opt) => {
                        const icons: Record<string, React.ReactNode> = {
                          full_bar: <GlassWater className="w-6 h-6" />,
                          cocktails: <Wine className="w-6 h-6" />,
                          beer_wine: <Beer className="w-6 h-6" />,
                          non_alcoholic: <Coffee className="w-6 h-6" />,
                        };
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setBooking({...booking, drink_preference: booking.drink_preference === opt.value ? "" : opt.value})}
                            className={`p-4 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2 ${
                              booking.drink_preference === opt.value
                                ? 'border-olive-gold bg-olive-gold/10 shadow-lg shadow-olive-gold/10'
                                : 'border-warm-sand/20 hover:border-warm-sand/50 hover:scale-[1.02]'
                            }`}
                          >
                            {icons[opt.value]}
                            <span className="text-sm text-warm-white">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <textarea
                  placeholder="Special requests, dietary restrictions, signature cocktails, etc."
                  value={booking.dietary_notes}
                  onChange={(e) => setBooking({...booking, dietary_notes: e.target.value})}
                  className="flex min-h-24 w-full rounded-lg border border-warm-sand/30 bg-charcoal px-4 py-3 text-base text-warm-white placeholder:text-warm-sand/50 resize-none"
                  rows={3}
                />

                <div className="flex gap-3 pt-2">
                  {submitSuccess ? (
                    <div className="w-full py-8 text-center rounded-xl bg-gradient-to-b from-olive-gold/10 to-charcoal border border-olive-gold/30">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-olive-gold/20 flex items-center justify-center">
                        <Check className="w-8 h-8 text-olive-gold" />
                      </div>
                      <p className="text-2xl font-bold text-warm-white mb-2">Request Sent!</p>
                      <p className="text-warm-sand mb-6">We&apos;ll get back to you within 24 hours.</p>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-warm-sand/70">What happens next?</p>
                        <p className="text-sm text-warm-sand">1. We review your request</p>
                        <p className="text-sm text-warm-sand">2. Check availability for your date(s)</p>
                        <p className="text-sm text-warm-sand">3. Send you a custom quote</p>
                      </div>
                      <button 
                        onClick={() => { setShowBooking(false); setSubmitSuccess(false); setBooking({...booking, dates: [], start_time: "", end_time: "", guest_count: "", venue_name: "", venue_address: "", drink_preference: "", name: "", email: "", phone: ""}); setShowPackages(true); }}
                        className="mt-6 px-6 py-3 rounded-lg bg-olive-gold text-charcoal font-semibold hover:bg-warm-white transition-colors"
                      >
                        Send Another Request
                      </button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleSubmitBooking}
                      disabled={!booking.name || !booking.email || booking.dates.length === 0 || !booking.guest_count || !booking.venue_name || isSubmitting}
                      className="flex-1 py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Request
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button 
              onClick={() => setShowBooking(true)}
              className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Request a Quote
            </Button>
          )}

        </div>

        {publicPackages.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-warm-white mb-6">Our Packages</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {publicPackages.map((pkg) => (
                <Card key={pkg.id} className="bg-charcoal border-warm-sand/20 hover:border-olive-gold/50 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-warm-white">{pkg.name}</h3>
                      <span className="text-xl font-bold text-olive-gold">
                        ${pkg.base_price}
                        <span className="text-sm text-warm-sand font-normal">
                          {pkg.pricing_type === "per_guest" ? "/guest" : pkg.pricing_type === "hourly" ? "/hr" : ""}
                        </span>
                      </span>
                    </div>
                    {pkg.description && (
                      <p className="text-warm-sand text-sm mb-3">{pkg.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-sm text-warm-sand">
                      {pkg.min_guests && pkg.max_guests && (
                        <span className="bg-warm-sand/10 px-2 py-1 rounded">
                          {pkg.min_guests}-{pkg.max_guests} guests
                        </span>
                      )}
                      {pkg.includes_bartenders && (
                        <span className="bg-warm-sand/10 px-2 py-1 rounded">
                          {pkg.includes_bartenders} bartender{pkg.includes_bartenders > 1 ? "s" : ""}
                        </span>
                      )}
                      {pkg.includes_glassware && (
                        <span className="bg-warm-sand/10 px-2 py-1 rounded">
                          Glassware included
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {publicGallery.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-warm-white mb-6">Our Work</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {publicGallery.map((item) => (
                <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-warm-sand/10">
                  <Image
                    src={item.url}
                    alt={item.caption || "Gallery image"}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-warm-white mb-6">Contact Us</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button 
              onClick={() => setShowBooking(true)}
              className="flex items-center gap-3 p-4 rounded-lg border border-olive-gold/50 bg-olive-gold/10 hover:bg-olive-gold/20 hover:border-olive-gold transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-olive-gold" />
              <span className="text-warm-white font-medium">Message via OnTap</span>
            </button>
            
            <div className="flex items-center gap-3 p-4 rounded-lg border border-warm-sand/20 bg-charcoal">
              <Phone className="w-6 h-6 text-olive-gold" />
              <span className="text-warm-white">{organization.phone || "(555) 123-4567"}</span>
            </div>
            
            <button 
              onClick={() => setShowEmailPopup(true)}
              className="flex items-center gap-3 p-4 rounded-lg border border-warm-sand/20 bg-charcoal hover:border-olive-gold transition-colors"
            >
              <Mail className="w-6 h-6 text-olive-gold" />
              <span className="text-warm-white">Send Email</span>
            </button>
            
            {organization.website && (
              <a href={organization.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-lg border border-warm-sand/20 bg-charcoal hover:border-olive-gold transition-colors">
                <Globe className="w-6 h-6 text-olive-gold" />
                <span className="text-warm-white">{organization.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
          </div>
        </div>

        {showEmailPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowEmailPopup(false)} />
            <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-warm-white">Send Message</h3>
                <button onClick={() => setShowEmailPopup(false)} className="text-warm-sand hover:text-warm-white">✕</button>
              </div>
              
              {emailSent ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">✓</div>
                  <p className="text-warm-white">Message sent!</p>
                  <p className="text-warm-sand text-sm">We&apos;ll get back to you soon.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    placeholder="Your Name"
                    value={emailForm.name}
                    onChange={(e) => setEmailForm({...emailForm, name: e.target.value})}
                    className="flex h-12 w-full rounded-lg border border-warm-sand/30 bg-charcoal px-4 py-3 text-base text-warm-white"
                  />
                  <input
                    placeholder="Your Email"
                    type="email"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({...emailForm, email: e.target.value})}
                    className="flex h-12 w-full rounded-lg border border-warm-sand/30 bg-charcoal px-4 py-3 text-base text-warm-white"
                  />
                  <input
                    placeholder="Subject"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                    className="flex h-12 w-full rounded-lg border border-warm-sand/30 bg-charcoal px-4 py-3 text-base text-warm-white"
                  />
                  <textarea
                    placeholder="Message"
                    value={emailForm.message}
                    onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                    className="flex min-h-32 w-full rounded-lg border border-warm-sand/30 bg-charcoal px-4 py-3 text-base text-warm-white resize-none"
                    rows={4}
                  />
                  <Button 
                    onClick={() => setEmailSent(true)}
                    disabled={!emailForm.name || !emailForm.email || !emailForm.message}
                    className="w-full"
                  >
                    Send Message
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {(organization.city || organization.service_area) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-warm-white mb-6">Location</h2>
            <Card className="bg-charcoal border-warm-sand/20">
              <CardContent className="p-6 flex items-start gap-3">
                <MapPin className="w-6 h-6 text-olive-gold mt-1" />
                <div>
                  {organization.city && organization.state && (
                    <p className="text-warm-white text-lg">{organization.city}, {organization.state}</p>
                  )}
                  {organization.service_area && (
                    <p className="text-warm-sand">Also serving: {organization.service_area}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center text-warm-sand text-sm pt-8 border-t border-warm-sand/20">
          <p>Powered by OnTap</p>
        </div>
      </div>
    </div>
  );
}