"use client";

import { useState } from "react";
import { Button, Input, Textarea } from "@/ui/primitives";
import { submitInquiry } from "@/modules/profile/actions/inquiry";

const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "birthday", label: "Birthday Party" },
  { value: "private_party", label: "Private Party" },
  { value: "festival", label: "Festival" },
  { value: "popup", label: "Popup Bar" },
  { value: "other", label: "Other" },
];

interface InquiryFormProps {
  orgSlug: string;
}

export function InquiryForm({ orgSlug }: InquiryFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    event_type: "",
    date: "",
    guest_count: "",
    venue_name: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await submitInquiry(orgSlug, {
        ...form,
        guest_count: form.guest_count ? parseInt(form.guest_count) : undefined,
      });
      setSuccess(true);
      setOpen(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        event_type: "",
        date: "",
        guest_count: "",
        venue_name: "",
        notes: "",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-charcoal border border-warm-sand/20 rounded-xl p-8 text-center animate-fade-in">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-warm-white mb-2">Thank you!</h3>
        <p className="text-warm-sand mb-4">We&apos;ve received your inquiry and will be in touch soon.</p>
        <Button onClick={() => setSuccess(false)} variant="secondary">
          Send Another Inquiry
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className="w-full py-4 text-lg font-semibold"
      >
        Request a Quote
      </Button>

      {open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-4"
          onClick={() => setOpen(false)}
        >
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setOpen(false)}
          />
          <div 
            className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-warm-white">Get a Quote</h2>
              <button 
                onClick={() => setOpen(false)} 
                className="text-warm-sand hover:text-warm-white transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Smith"
                required
              />
              
              <Input
                label="Email *"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
              
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />

              <div>
                <label className="label">Event Type *</label>
                <select
                  className="w-full px-3 py-2 bg-charcoal border border-warm-sand/20 rounded-lg text-warm-white focus:outline-none focus:border-olive-gold"
                  value={form.event_type}
                  onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                  required
                >
                  <option value="">Select event type</option>
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Event Date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
                
                <Input
                  label="Guest Count"
                  type="number"
                  value={form.guest_count}
                  onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
                  placeholder="100"
                />
              </div>
              
              <Input
                label="Venue Name"
                value={form.venue_name}
                onChange={(e) => setForm({ ...form, venue_name: e.target.value })}
                placeholder="The Grand Ballroom"
              />
              
              <Textarea
                label="Tell us about your event"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special requirements, preferred drinks, budget, etc."
                rows={3}
              />
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !form.name || !form.email || !form.event_type}
                  className="flex-1"
                >
                  {loading ? "Sending..." : "Send Inquiry"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}