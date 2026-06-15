"use client";

import { useState } from "react";
import { Button, Input, Textarea } from "@/ui/primitives";
import { sendEmail, sendSMS } from "@/modules/crm/actions/messaging";
import { Mail, MessageSquare, Send, X, Loader2 } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

interface MessagePanelProps {
  contact: Contact;
  onClose: () => void;
  orgId: string;
}

export function MessagePanel({ contact, onClose, orgId }: MessagePanelProps) {
  const [type, setType] = useState<"email" | "sms">("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!body.trim()) return;
    
    setSending(true);
    setError("");
    setSuccess(false);

    try {
      if (type === "email") {
        if (!contact.email) {
          throw new Error("No email address for this contact");
        }
        await sendEmail(contact.email, subject, body, contact.id, orgId);
      } else {
        if (!contact.phone) {
          throw new Error("No phone number for this contact");
        }
        await sendSMS(contact.phone, body, contact.id, orgId);
      }
      setSuccess(true);
      setSubject("");
      setBody("");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const canSend = type === "email" ? !!contact.email : !!contact.phone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-charcoal border border-warm-sand/20 rounded-xl p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-warm-white">Send Message</h2>
          <button onClick={onClose} className="text-warm-sand hover:text-warm-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setType("email")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === "email"
                ? "bg-olive-gold text-charcoal"
                : "text-warm-sand hover:text-warm-white bg-warm-sand/10"
            }`}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => setType("sms")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === "sms"
                ? "bg-olive-gold text-charcoal"
                : "text-warm-sand hover:text-warm-white bg-warm-sand/10"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            SMS
          </button>
        </div>

        {!canSend && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">
              {type === "email" 
                ? `No email address for ${contact.name}` 
                : `No phone number for ${contact.name}`}
            </p>
          </div>
        )}

        {type === "email" && (
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
            className="mb-3"
          />
        )}

        <Textarea
          label={type === "email" ? "Message" : "SMS"}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={type === "email" ? "Write your email..." : "Write your message..."}
          className="min-h-[150px] mb-4"
        />

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm">Message sent successfully!</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || !canSend || !body.trim()}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
