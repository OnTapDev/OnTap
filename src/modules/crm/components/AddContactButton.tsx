"use client";

import { useState } from "react";
import { Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives";
import { createContact } from "@/modules/crm/actions/contacts";

type Stage = {
  id: string;
  name: string;
  color: string;
  order: number;
};

interface AddContactButtonProps {
  stages: Stage[];
  orgId: string;
}

export function AddContactButton({ stages, orgId }: AddContactButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    source: "",
    notes: "",
    stage_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createContact(orgId, {
        ...form,
        stage_id: form.stage_id || undefined,
      });
      setOpen(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        role: "",
        source: "",
        notes: "",
        stage_id: "",
      });
    } catch (error) {
      console.error("Error creating contact:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Add Contact
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-warm-white mb-6">Add New Contact</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Smith"
                required
              />
              
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
              />
              
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
              
              <Input
                label="Company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Acme Inc."
              />
              
              <div>
                <label className="label">Role</label>
                <Select
                  value={form.role}
                  onValueChange={(value) => setForm({ ...form, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bride">Bride</SelectItem>
                    <SelectItem value="groom">Groom</SelectItem>
                    <SelectItem value="event_planner">Event Planner</SelectItem>
                    <SelectItem value="venue_manager">Venue Manager</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="birthday_host">Birthday Host</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="label">Stage</label>
                <Select
                  value={form.stage_id}
                  onValueChange={(value) => setForm({ ...form, stage_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="label">Source</label>
                <Select
                  value={form.source}
                  onValueChange={(value) => setForm({ ...form, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How did they find you?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="venue">Venue Referral</SelectItem>
                    <SelectItem value="wedding_show">Wedding Show</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Textarea
                label="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional notes..."
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
                  disabled={loading || !form.name}
                  className="flex-1"
                >
                  {loading ? "Adding..." : "Add Contact"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
