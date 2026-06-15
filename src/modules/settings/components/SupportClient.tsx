"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea } from "@/ui/primitives";
import { createSupportRequest } from "@/modules/settings/actions/support";
import { HelpCircle, Lightbulb, Bug, MessageCircle, Send } from "lucide-react";

type SupportRequest = {
  id: string;
  type: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
};

interface SupportClientProps {
  requests: SupportRequest[];
}

const typeOptions = [
  { value: "help", label: "Help/Question", icon: HelpCircle },
  { value: "feature", label: "Feature Idea", icon: Lightbulb },
  { value: "bug", label: "Bug Report", icon: Bug },
  { value: "other", label: "Other", icon: MessageCircle },
];

const statusColors: Record<string, string> = {
  open: "bg-yellow-500/20 text-yellow-400",
  in_progress: "bg-blue-500/20 text-blue-400",
  resolved: "bg-green-500/20 text-green-400",
  closed: "bg-gray-500/20 text-gray-400",
};

export function SupportClient({ requests }: SupportClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: "help" as "help" | "bug" | "feature" | "other",
    subject: "",
    description: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await createSupportRequest({
        type: form.type,
        subject: form.subject,
        description: form.description,
        priority: form.priority,
      });
      
      setShowForm(false);
      setForm({
        type: "help",
        subject: "",
        description: "",
        priority: "normal",
      });
      
      // Refresh the list (in a real app, you'd revalidate)
      window.location.reload();
    } catch {
      console.error("Error submitting request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-screen-title text-warm-white">Support</h1>
          <p className="text-warm-sand mt-1">Get help or share your ideas</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Send className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {showForm && (
        <Card className="bg-charcoal border-warm-sand/20">
          <CardHeader>
            <CardTitle className="text-warm-white">Submit a Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: opt.value as any })}
                      className={`p-3 rounded-lg border transition-colors ${
                        form.type === opt.value
                          ? "border-olive-gold bg-olive-gold/20 text-warm-white"
                          : "border-warm-sand/20 text-warm-sand hover:border-warm-sand/40"
                      }`}
                    >
                      <opt.icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief summary of your request"
                required
              />

              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Please describe what you need help with or your idea..."
                rows={4}
                required
              />

              <div>
                <label className="label">Priority</label>
                <select
                  className="select"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !form.subject || !form.description}
                  className="flex-1"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {requests.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-section-title text-warm-white">Your Requests</h2>
          {requests.map((req) => (
            <Card key={req.id} className="bg-charcoal border-warm-sand/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColors[req.status]}`}>
                        {req.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-warm-sand">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-warm-white font-medium">{req.subject}</h3>
                    <p className="text-sm text-warm-sand mt-1 line-clamp-2">{req.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-charcoal border-warm-sand/20">
          <CardContent className="p-8 text-center">
            <HelpCircle className="w-12 h-12 text-warm-sand/50 mx-auto mb-4" />
            <p className="text-warm-sand">No support requests yet</p>
            <p className="text-sm text-warm-sand/70 mt-1">
              Submit a request if you need help or have an idea
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}