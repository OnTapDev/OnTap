"use client";

import { useState } from "react";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives";
import { createInvoice } from "@/modules/invoices/actions/invoices";

type Event = {
  id: string;
  name: string;
  date: string;
  total_price: number;
};

interface CreateInvoiceButtonProps {
  events: Event[];
  orgId: string;
}

export function CreateInvoiceButton({ events, orgId }: CreateInvoiceButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    event_id: "",
    amount: "",
    deposit_amount: "",
    balance_due: "",
    due_date: "",
  });

  const selectedEvent = events.find(e => e.id === form.event_id);

  const handleAmountChange = (field: string, value: string) => {
    setForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      if (field === "amount" || field === "deposit_amount") {
        const amount = parseFloat(newForm.amount) || 0;
        const deposit = parseFloat(newForm.deposit_amount) || 0;
        newForm.balance_due = (amount - deposit).toString();
      }
      
      return newForm;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createInvoice(orgId, {
        event_id: form.event_id,
        amount: parseFloat(form.amount),
        deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : undefined,
        balance_due: parseFloat(form.balance_due) || parseFloat(form.amount),
        status: "draft",
        due_date: form.due_date || undefined,
      });
      setOpen(false);
      setForm({
        event_id: "",
        amount: "",
        deposit_amount: "",
        balance_due: "",
        due_date: "",
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Create Invoice
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-warm-white mb-6">Create Invoice</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Event *</label>
                <Select
                  value={form.event_id}
                  onValueChange={(value) => {
                    setForm({ ...form, event_id: value });
                    const event = events.find(e => e.id === value);
                    if (event) {
                      setForm(prev => ({
                        ...prev,
                        event_id: value,
                        amount: event.total_price.toString(),
                        balance_due: event.total_price.toString(),
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name} - {new Date(event.date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Input
                label="Invoice Amount *"
                type="number"
                value={form.amount}
                onChange={(e) => handleAmountChange("amount", e.target.value)}
                placeholder="0.00"
                required
              />
              
              <Input
                label="Deposit Amount"
                type="number"
                value={form.deposit_amount}
                onChange={(e) => handleAmountChange("deposit_amount", e.target.value)}
                placeholder="0.00"
              />
              
              <Input
                label="Balance Due"
                type="number"
                value={form.balance_due}
                onChange={(e) => setForm({ ...form, balance_due: e.target.value })}
                placeholder="0.00"
              />
              
              <Input
                label="Due Date"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
              
              {selectedEvent && (
                <div className="bg-warm-sand/10 rounded-lg p-3 text-sm">
                  <p className="text-warm-sand">Event Total: <span className="text-warm-white">${selectedEvent.total_price.toLocaleString()}</span></p>
                </div>
              )}
              
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
                  disabled={loading || !form.event_id || !form.amount}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Create Invoice"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
