"use client";

import { useState, useMemo } from "react";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives";
import { createQuote } from "@/modules/quotes/actions/quotes";

type Contact = {
  id: string;
  name: string;
};

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
};

interface CreateQuoteButtonProps {
  packages: Package[];
  contacts: Contact[];
  orgId: string;
}

const availableAddOns = [
  { id: "signature_cocktails", name: "Signature Cocktails", price: 150 },
  { id: "glassware_upgrade", name: "Premium Glassware", price: 200 },
  { id: "smoke_gun", name: "Smoke Gun", price: 175 },
  { id: "nitrogen", name: "Nitrogen Cocktails", price: 125 },
  { id: "coffee_bar", name: "Coffee Bar", price: 250 },
  { id: "mocktail_station", name: "Mocktail Station", price: 150 },
];

const TAX_RATE = 0.0875; // 8.75% tax rate

export function CreateQuoteButton({ packages, contacts, orgId }: CreateQuoteButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contact_id: "",
    package_id: "",
    guest_count: "75",
    add_ons: [] as string[],
  });

  const selectedPackage = packages.find(p => p.id === form.package_id);
  
  const pricing = useMemo(() => {
    if (!selectedPackage) return { subtotal: 0, tax: 0, total: 0 };
    
    const guests = parseInt(form.guest_count) || 0;
    let packagePrice = 0;
    
    if (selectedPackage.pricing_type === "per_guest") {
      packagePrice = selectedPackage.base_price * guests;
    } else if (selectedPackage.pricing_type === "flat") {
      packagePrice = selectedPackage.base_price;
    } else if (selectedPackage.pricing_type === "hourly") {
      packagePrice = selectedPackage.base_price * 5; // Assume 5 hours default
    }
    
    const addOnsTotal = form.add_ons.reduce((sum, addOnId) => {
      const addOn = availableAddOns.find(a => a.id === addOnId);
      return sum + (addOn?.price || 0);
    }, 0);
    
    const subtotal = packagePrice + addOnsTotal;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  }, [selectedPackage, form.guest_count, form.add_ons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const addOnsObject = form.add_ons.reduce((acc, id) => {
        const addOn = availableAddOns.find(a => a.id === id);
        if (addOn) acc[id] = addOn.price;
        return acc;
      }, {} as Record<string, number>);
      
      await createQuote(orgId, {
        contact_id: form.contact_id,
        package_id: form.package_id || undefined,
        guest_count: parseInt(form.guest_count),
        add_ons: addOnsObject,
        subtotal: pricing.subtotal,
        tax: pricing.tax,
        total: pricing.total,
        status: "draft",
      });
      setOpen(false);
      setForm({
        contact_id: "",
        package_id: "",
        guest_count: "75",
        add_ons: [],
      });
    } catch (error) {
      console.error("Error creating quote:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAddOn = (addOnId: string) => {
    setForm(prev => ({
      ...prev,
      add_ons: prev.add_ons.includes(addOnId)
        ? prev.add_ons.filter(id => id !== addOnId)
        : [...prev.add_ons, addOnId]
    }));
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Create Quote
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-warm-white mb-6">Create Quote</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Contact *</label>
                <Select
                  value={form.contact_id}
                  onValueChange={(value) => setForm({ ...form, contact_id: value })}
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
                  {availableAddOns.map((addOn) => (
                    <button
                      key={addOn.id}
                      type="button"
                      onClick={() => toggleAddOn(addOn.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        form.add_ons.includes(addOn.id)
                          ? "border-olive-gold bg-olive-gold/20"
                          : "border-warm-sand/20 hover:border-warm-sand/40"
                      }`}
                    >
                      <p className="text-sm text-warm-white">{addOn.name}</p>
                      <p className="text-xs text-warm-sand">+${addOn.price}</p>
                    </button>
                  ))}
                </div>
              </div>
              
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
                  disabled={loading || !form.contact_id || !form.package_id}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Create Quote"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
