"use client";

import { useState } from "react";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives";
import { updateInvoice } from "@/modules/invoices/actions/invoices";

type Invoice = {
  id: string;
  amount: number;
  deposit_amount: number | null;
  balance_due: number;
  status: string;
  due_date: string | null;
  event: { name: string } | null;
};

interface EditInvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
}

const invoiceStatuses = ["draft", "sent", "paid", "partial", "overdue", "cancelled"];

export function EditInvoiceModal({ invoice, onClose }: EditInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    amount: String(invoice.amount),
    deposit_amount: invoice.deposit_amount != null ? String(invoice.deposit_amount) : "",
    balance_due: String(invoice.balance_due),
    status: invoice.status,
    due_date: invoice.due_date ? invoice.due_date.slice(0, 10) : "",
  });

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
      await updateInvoice(invoice.id, {
        amount: parseFloat(form.amount) || 0,
        deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : undefined,
        balance_due: parseFloat(form.balance_due) || 0,
        status: form.status,
        due_date: form.due_date || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-warm-white mb-6">Edit Invoice</h2>
        {invoice.event?.name && (
          <p className="text-sm text-warm-sand mb-6 -mt-4">{invoice.event.name}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}