"use client";

import { useState } from "react";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives";
import { createInvoice, updateInvoice } from "@/modules/invoices/actions/invoices";

type Event = {
  id: string;
  contact_id: string;
  name: string;
  date: string;
  total_price: number;
  contact: { id: string; name: string; email: string | null } | null;
};

type Quote = {
  id: string;
  event_id: string | null;
  total: number;
  status: string;
  contact: { name: string; email: string } | null;
};

type Invoice = {
  id: string;
  amount: number;
  deposit_amount: number | null;
  balance_due: number;
  status: string;
  due_date: string | null;
  event: { name: string } | null;
};

interface InvoiceFormModalProps {
  invoice?: Invoice | null;
  events?: Event[];
  quotes?: Quote[];
  orgId: string;
  onClose: () => void;
}

const invoiceStatuses = ["draft", "sent", "paid", "partial", "overdue", "cancelled"];

export function InvoiceFormModal({ invoice, events = [], quotes = [], orgId, onClose }: InvoiceFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    event_id: "",
    quote_id: "",
    amount: invoice ? String(invoice.amount) : "",
    deposit_amount: invoice?.deposit_amount != null ? String(invoice.deposit_amount) : "",
    balance_due: invoice ? String(invoice.balance_due) : "",
    status: invoice?.status || "draft",
    due_date: invoice?.due_date ? invoice.due_date.slice(0, 10) : "",
  });

  const isEdit = !!invoice;

  const eventQuotes = quotes.filter(q => q.event_id === form.event_id);

  const handleEventChange = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    setForm(prev => ({
      ...prev,
      event_id: eventId,
      quote_id: "",
      amount: event ? event.total_price.toString() : "",
      balance_due: event ? event.total_price.toString() : "",
    }));
  };

  const handleQuoteChange = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    setForm(prev => ({
      ...prev,
      quote_id: quoteId,
      amount: quote ? quote.total.toString() : prev.amount,
      balance_due: quote ? quote.total.toString() : prev.balance_due,
    }));
  };

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
    setError("");

    try {
      const amount = parseFloat(form.amount) || 0;
      const deposit = parseFloat(form.deposit_amount) || 0;

      if (isEdit) {
        await updateInvoice(invoice.id, {
          amount,
          deposit_amount: form.deposit_amount ? deposit : undefined,
          balance_due: parseFloat(form.balance_due) || 0,
          status: form.status,
          due_date: form.due_date || undefined,
        });
      } else {
        await createInvoice(orgId, {
          event_id: form.event_id,
          quote_id: form.quote_id || undefined,
          amount,
          deposit_amount: form.deposit_amount ? deposit : undefined,
          balance_due: parseFloat(form.balance_due) || amount,
          status: form.status,
          due_date: form.due_date || undefined,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : isEdit ? "Failed to update invoice" : "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-warm-white mb-6">{isEdit ? "Edit Invoice" : "Create Invoice"}</h2>
        {isEdit && invoice.event?.name && (
          <p className="text-sm text-warm-sand mb-6 -mt-4">{invoice.event.name}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <>
              <div>
                <label className="label">Event *</label>
                <Select
                  value={form.event_id}
                  onValueChange={handleEventChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name} - {event.contact?.name || "No client"} - {new Date(event.date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="label">Quote (optional)</label>
                <Select
                  value={form.quote_id}
                  onValueChange={handleQuoteChange}
                  disabled={!form.event_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.event_id ? "Select quote" : "Select an event first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {eventQuotes.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-warm-sand">
                        {form.event_id ? "No quotes for this event yet" : "Select an event to see its quotes"}
                      </div>
                    ) : (
                      eventQuotes.map((quote) => (
                        <SelectItem key={quote.id} value={quote.id}>
                          Quote #{quote.id.slice(0, 8)} - ${quote.total.toLocaleString()}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Input
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => handleAmountChange("amount", e.target.value)}
          />

          <Input
            label="Deposit Paid"
            type="number"
            value={form.deposit_amount}
            onChange={(e) => handleAmountChange("deposit_amount", e.target.value)}
          />

          <Input
            label="Balance Due"
            type="number"
            value={form.balance_due}
            onChange={(e) => setForm({ ...form, balance_due: e.target.value })}
          />

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
                {invoiceStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            label="Due Date"
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!isEdit && !form.event_id)} className="flex-1">
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Invoice"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}