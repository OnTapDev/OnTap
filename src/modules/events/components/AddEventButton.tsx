"use client";

import { useState } from "react";
import { Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives";
import { createEvent } from "@/modules/events/actions/events";

type Contact = {
  id: string;
  name: string;
};

interface AddEventButtonProps {
  contacts: Contact[];
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

export function AddEventButton({ contacts, orgId }: AddEventButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contact_id: "",
    name: "",
    type: "",
    date: "",
    start_time: "",
    end_time: "",
    venue_name: "",
    venue_address: "",
    guest_count: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createEvent(orgId, {
        contact_id: form.contact_id,
        name: form.name,
        type: form.type,
        date: form.date,
        start_time: form.start_time || undefined,
        end_time: form.end_time || undefined,
        venue_name: form.venue_name || undefined,
        venue_address: form.venue_address || undefined,
        guest_count: parseInt(form.guest_count) || 0,
        notes: form.notes || undefined,
      });
      setOpen(false);
      setForm({
        contact_id: "",
        name: "",
        type: "",
        date: "",
        start_time: "",
        end_time: "",
        venue_name: "",
        venue_address: "",
        guest_count: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating event:", error);
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
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-warm-white mb-6">Add New Event</h2>
            
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
              
              <Input
                label="Event Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Smith Wedding"
                required
              />
              
              <div>
                <label className="label">Event Type *</label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm({ ...form, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Input
                label="Date *"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                />
                <Input
                  label="End Time"
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
              
              <Input
                label="Venue Name"
                value={form.venue_name}
                onChange={(e) => setForm({ ...form, venue_name: e.target.value })}
                placeholder="The Grand Ballroom"
              />
              
              <Input
                label="Venue Address"
                value={form.venue_address}
                onChange={(e) => setForm({ ...form, venue_address: e.target.value })}
                placeholder="123 Main St, City, State"
              />
              
              <Input
                label="Guest Count"
                type="number"
                value={form.guest_count}
                onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
                placeholder="150"
              />
              
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
                  disabled={loading || !form.name || !form.contact_id || !form.date}
                  className="flex-1"
                >
                  {loading ? "Adding..." : "Add Event"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
