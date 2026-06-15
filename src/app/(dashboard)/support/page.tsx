"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives";
import { createSupportRequest } from "@/modules/settings/actions/support";
import { HelpCircle, Lightbulb, Bug, MessageCircle, Send, Check } from "lucide-react";

const typeOptions = [
  { value: "help" as const, label: "Help", icon: HelpCircle, desc: "I need help with..." },
  { value: "feature" as const, label: "Feature Idea", icon: Lightbulb, desc: "I propose..." },
  { value: "bug" as const, label: "Bug", icon: Bug, desc: "I found an issue..." },
  { value: "other" as const, label: "Other", icon: MessageCircle, desc: "I want to share..." },
];

export default function SupportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    type: "help" as "help" | "bug" | "feature" | "other",
    subject: "",
    description: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createSupportRequest({
        type: form.type,
        subject: form.subject,
        description: form.description,
        priority: form.priority,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-screen-title text-warm-white">Support</h1>
          <p className="text-warm-sand mt-1">Get help or share your ideas</p>
        </div>
        
        <Card className="bg-charcoal border-warm-sand/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-warm-white mb-2">Request Submitted!</h2>
            <p className="text-warm-sand mb-6">Thank you for your feedback. We&apos;ll get back to you soon.</p>
            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-screen-title text-warm-white">Support</h1>
        <p className="text-warm-sand mt-1">Get help or share your ideas</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
                        onClick={() => setForm({ ...form, type: opt.value })}
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
                  placeholder={typeOptions.find(o => o.value === form.type)?.desc || "Please describe..."}
                  rows={4}
                  required
                />

                <div>
                  <label className="label">Priority</label>
                  <Select
                    value={form.priority}
                    onValueChange={(value: "low" | "normal" | "high" | "urgent") => setForm({ ...form, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General question</SelectItem>
                      <SelectItem value="normal">Normal - Need help</SelectItem>
                      <SelectItem value="high">High - Urgent issue</SelectItem>
                      <SelectItem value="urgent">Critical - Can&apos;t work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !form.subject || !form.description}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-charcoal border-warm-sand/20">
            <CardHeader>
              <CardTitle className="text-warm-white">Quick Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="https://ontap.io/docs" target="_blank" className="block p-3 bg-warm-sand/10 rounded-lg text-warm-sand hover:text-warm-white">
                📚 Documentation
              </a>
              <a href="mailto:support@ontap.io" className="block p-3 bg-warm-sand/10 rounded-lg text-warm-sand hover:text-warm-white">
                ✉️ Email Support
              </a>
              <p className="text-xs text-warm-sand/60 mt-4">
                We typically respond within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}