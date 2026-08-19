"use client";

import { useState, useMemo } from "react";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives";
import { createQuote, updateQuote } from "@/modules/quotes/actions/quotes";

type Contact = {
  id: string;
  name: string;
};

type Package = {
  id: string;
  name: string;
  base_price: number;
  pricing_type: "per_guest" | "flat" | "hourly";
};

type AddOn = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
};

type Event = {
  id: string;
  contact_id: string;
  name: string;
  date: string;
};

type Quote = {
  id: string;
  contact_id: string;
  event_id: string | null;
  package_id: string | null;
  guest_count: number;
  add_ons: Record<string, number>;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  expires_at: string | null;
};

interface QuoteFormModalProps {
  quote?: Quote | null;
  packages: Package[];
  addOns: AddOn[];
  contacts: Contact[];
  events: Event[];
  orgId: string;
  onClose: () => void;
}

const TAX_RATE = 0.0875;

const quoteStatuses = ["draft", "sent", "accepted", "rejected", "expired"];

export function QuoteFormModal({ quote, packages, addOns, contacts, events, orgId, onClose }: QuoteFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    contact_id: quote?.contact_id || "",
    event_id: quote?.event_id || "",
    package_id: quote?.package_id || "",
    guest_count: quote ? String(quote.guest_count) : "75",
    add_ons: Object.keys(quote?.add_ons || {}),
    status: quote?.status || "draft",
    expires_at: quote?.expires_at ? quote.expires_at.slice(0, 10) : "",
  });

  const isEdit = !!quote;
  const contactEvents = events.filter(e => e.contact_id === form.contact_id);
  const selectedPackage = packages.find(p => p.id === form.package_id);

  const pricing = useMemo(() => {
    if (!selectedPackage) return { subtotal: quote?.subtotal || 0, tax: quote?.tax || 0, total: quote?.total || 0 };

    const guests = parseInt(form.guest_count) || 0;
    let packagePrice = 0;

    if (selectedPackage.pricing_type === "per_guest") {
      packagePrice = selectedPackage.base_price * guests;
    } else if (selectedPackage.pricing_type === "flat") {
      packagePrice = selectedPackage.base_price;
    } else if (selectedPackage.pricing_type === "hourly") {
      packagePrice = selectedPackage.base_price * 5;
    }

    const addOnsTotal = form.add_ons.reduce((sum, addOnId) => {
      const addOn = addOns.find((a: AddOn) => a.id === addOnId);
      return sum + (addOn?.price || 0);
    }, 0);

    const subtotal = packagePrice + addOnsTotal;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }, [selectedPackage, form.guest_count, form.add_ons, addOns, quote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const addOnsObject = form.add_ons.reduce((acc, id) => {
        const addOn = addOns.find((a: AddOn) => a.id === id);
        if (addOn) acc[id] = addOn.price;
        return acc;
      }, {} as Record<string, number>);

      const payload = {
        contact_id: form.contact_id,
        event_id: form.event_id || undefined,
        package_id: form.package_id || undefined,
        guest_count: parseInt(form.guest_count) || 0,
        add_ons: addOnsObject,
        subtotal: pricing.subtotal,
        tax: pricing.tax,
        total: pricing.total,
        status: form.status,
        expires_at: form.expires_at || undefined,
      };

      if (isEdit) {
        await updateQuote(quote.id, payload);
      } else {
        await createQuote(orgId, payload);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : isEdit ? "Failed to update quote" : "Failed to create quote");
    } finally {
      setLoading(false);
    }
  };

  const toggleAddOn = (addOnId: string) => {
    setForm(prev => ({
      ...prev,
      add_ons: prev.add_ons.includes(addOnId)
        ? prev.add_ons.filter(id => id !== addOnId)
        : [...prev.add_ons, addOnId],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-warm-white mb-6">{isEdit ? "Edit Quote" : "Create Quote"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Contact *</label>
            <Select
              value={form.contact_id}
              onValueChange={(value) => setForm({ ...form, contact_id: value, event_id: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="label">Event (optional)</label>
            <Select
              value={form.event_id}
              onValueChange={(value) => setForm({ ...form, event_id: value })}
              disabled={!form.contact_id}
            >
              <SelectTrigger>
                <SelectValue placeholder={form.contact_id ? "Select event" : "Select a contact first"} />
              </SelectTrigger>
              <SelectContent>
                {contactEvents.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-warm-sand">
                    {form.contact_id ? "No events for this contact yet" : "Select a contact to see its events"}
                  </div>
                ) : (
                  contactEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name} - {new Date(event.date).toLocaleDateString()}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="label">Package *</label>
            <Select
              value={form.package_id}
              onValueChange={(value) => setForm({ ...form, package_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select package" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name} - ${pkg.base_price}/{pkg.pricing_type === "per_guest" ? "guest" : pkg.pricing_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            label="Guest Count"
            type="number"
            value={form.guest_count}
            onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
          />

          <div>
            <label className="label">Add-ons</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {addOns.filter((a: AddOn) => a.is_active).map((addOn: AddOn) => (
                <button
                  key={addOn.id}
                  type="button"
                  onClick={() => toggleAddOn(addOn.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    form.add_ons.includes(addOn.id)
                      ? "border-warm-gold bg-warm-gold/20"
                      : "border-warm-sand/20 hover:border-warm-sand/40"
                  }`}
                >
                  <p className="text-sm text-warm-white">{addOn.name}</p>
                  <p className="text-xs text-warm-sand">+${addOn.price}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Status</label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm({ ...form, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {quoteStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            label="Expires At"
            type="date"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          />

          <div className="bg-warm-sand/10 rounded-lg p-4 mt-4">
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

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !form.contact_id} className="flex-1">
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Quote"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}