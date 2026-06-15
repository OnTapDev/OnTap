"use client";

import { useState } from "react";
import { Input, Card, CardHeader, CardTitle, CardContent } from "@/ui/primitives";
import { Bell, Link2, User, Lock, Mail, LogOut, HelpCircle, AlertTriangle } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { deleteUserAccount } from "@/lib/auth/actions";
import { updateUserPreferences, UserPreferences } from "@/lib/preferences/actions";
import { submitSupportTicket } from "@/lib/support/actions";

function SupportForm() {
  const [category, setCategory] = useState("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setSending(true);
    setError("");

    try {
      const result = await submitSupportTicket(category, subject, message);
      if (result.success) {
        setSent(true);
        setSubject("");
        setMessage("");
      } else {
        setError(result.error || "Failed to send");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
        <Mail className="w-10 h-10 text-green-400 mx-auto mb-3" />
        <p className="text-warm-white font-medium">Message Sent!</p>
        <p className="text-warm-sand text-sm mt-1">We&apos;ll get back to you soon.</p>
        <button 
          onClick={() => setSent(false)}
          className="text-olive-gold text-sm mt-3 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Category</label>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-charcoal border border-warm-sand/20 text-warm-white"
        >
          <option value="general">General Question</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
          <option value="billing">Billing Issue</option>
          <option value="account">Account Help</option>
        </select>
      </div>
      <div>
        <label className="label">Subject</label>
        <Input 
          placeholder="Brief description of your issue" 
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea 
          placeholder="Tell us more details..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="w-full px-3 py-2 rounded-lg bg-charcoal border border-warm-sand/20 text-warm-white placeholder:text-warm-sand/50 focus:border-olive-gold focus:outline-none"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button 
        type="submit" 
        disabled={sending}
        className="btn-primary w-full"
      >
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

function NotificationToggle({ 
  title, 
  description, 
  defaultChecked = false,
  onChange 
}: { 
  title: string; 
  description: string; 
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-lg hover:bg-warm-sand/10 transition-colors">
      <div>
        <h4 className="text-warm-white font-medium">{title}</h4>
        <p className="text-warm-sand text-sm">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          defaultChecked={defaultChecked} 
          className="sr-only peer" 
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <div className="w-11 h-6 bg-warm-sand/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-warm-sand after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-olive-gold peer-checked:after:bg-charcoal"></div>
      </label>
    </div>
  );
}

interface SettingsClientProps {
  userEmail?: string | null;
  emailVerified?: boolean;
  preferences?: UserPreferences | null;
  tickets?: Array<{
    id: string;
    category: string;
    subject: string;
    status: string;
    created_at: string;
  }>;
}

export function SettingsClient({ userEmail, emailVerified, preferences, tickets = [] }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState("account");
  const [deleting, setDeleting] = useState(false);

  const prefs = preferences;

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "integrations", label: "Integrations", icon: Link2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "support", label: "Support", icon: HelpCircle },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-screen-title text-warm-white">Settings</h1>
        <p className="text-warm-sand mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-warm-sand/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-olive-gold text-charcoal"
                : "text-warm-sand hover:text-warm-white hover:bg-warm-sand/10"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "account" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="label">Full Name</label>
                  <Input placeholder="Enter your full name" />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      defaultValue={userEmail || ""} 
                      placeholder="Enter your email" 
                      className="flex-1" 
                      disabled 
                    />
                  </div>
                  <p className="text-xs text-warm-sand mt-1">Email is managed through Clerk</p>
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <Input placeholder="Enter your phone" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="label">Organization Name</label>
                  <Input defaultValue="OnTap Bar Services" placeholder="Organization name" />
                </div>
                <div>
                  <label className="label">Role</label>
                  <Input value="Owner / Administrator" disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-warm-white font-medium">Sign Out</h4>
                  <p className="text-warm-sand text-sm">Sign out of your account on this device</p>
                </div>
                <SignOutButton>
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="label">Current Password</label>
                  <Input type="password" placeholder="Enter current password" />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <Input type="password" placeholder="Enter new password" />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <Input type="password" placeholder="Confirm new password" />
                </div>
                <button className="btn-primary text-sm">Update Password</button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-warm-white font-medium">Enable 2FA</h4>
                  <p className="text-warm-sand text-sm">Add an extra layer of security to your account</p>
                </div>
                <button className="btn-secondary text-sm">Enable</button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Verification</CardTitle>
            </CardHeader>
            <CardContent>
              {userEmail ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${emailVerified ? "bg-green-500/20" : "bg-yellow-500/20"}`}>
                      <Mail className={`w-5 h-5 ${emailVerified ? "text-green-400" : "text-yellow-400"}`} />
                    </div>
                    <div>
                      <h4 className="text-warm-white font-medium">{userEmail}</h4>
                      <p className={emailVerified ? "text-green-400 text-sm" : "text-yellow-400 text-sm"}>
                        {emailVerified ? "Verified" : "Pending verification"}
                      </p>
                    </div>
                  </div>
                  {!emailVerified && (
                    <button className="btn-secondary text-sm">Resend Verification</button>
                  )}
                </div>
              ) : (
                <p className="text-warm-sand text-sm">No email found</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-warm-sand text-sm">
                <p>Session management coming soon.</p>
                <p className="text-warm-sand/60 mt-1">You&apos;ll be able to see and manage your active sessions here.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Delete Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-warm-sand text-sm">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button 
                  onClick={async () => {
                    const confirmed = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
                    if (!confirmed) return;
                    
                    setDeleting(true);
                    try {
                      const result = await deleteUserAccount();
                      if (!result.success) {
                        alert(result.error || "Failed to delete account");
                        setDeleting(false);
                      }
                      // On success, user is redirected
                    } catch {
                      alert("An error occurred. Please try again.");
                      setDeleting(false);
                    }
                  }}
                  disabled={deleting}
                  className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete My Account"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "integrations" && (
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-w-lg">
              <div className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
                <div>
                  <h4 className="text-warm-white font-medium">Twilio</h4>
                  <p className="text-warm-sand text-sm">SMS notifications for clients</p>
                </div>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
                <div>
                  <h4 className="text-warm-white font-medium">Resend</h4>
                  <p className="text-warm-sand text-sm">Email notifications for clients</p>
                </div>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
                <div>
                  <h4 className="text-warm-white font-medium">Supabase</h4>
                  <p className="text-warm-sand text-sm">Database and authentication</p>
                </div>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle
                title="New Leads"
                description="Get notified when new contacts are added"
                defaultChecked={prefs?.email_new_leads ?? true}
                onChange={(checked) => updateUserPreferences({ email_new_leads: checked })}
              />
              <NotificationToggle
                title="Quote Updates"
                description="Updates on quotes sent to clients"
                defaultChecked={prefs?.email_quote_updates ?? true}
                onChange={(checked) => updateUserPreferences({ email_quote_updates: checked })}
              />
              <NotificationToggle
                title="Contract Signatures"
                description="When contracts are signed"
                defaultChecked={prefs?.email_contract_signatures ?? true}
                onChange={(checked) => updateUserPreferences({ email_contract_signatures: checked })}
              />
              <NotificationToggle
                title="Payment Received"
                description="Invoice payments and deposits"
                defaultChecked={prefs?.email_payment_received ?? true}
                onChange={(checked) => updateUserPreferences({ email_payment_received: checked })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SMS Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle
                title="Urgent Events"
                description="Urgent updates requiring immediate attention"
                defaultChecked={prefs?.sms_urgent_events ?? true}
                onChange={(checked) => updateUserPreferences({ sms_urgent_events: checked })}
              />
              <NotificationToggle
                title="Staff Assignments"
                description="When staff are assigned to events"
                defaultChecked={prefs?.sms_staff_assignments ?? false}
                onChange={(checked) => updateUserPreferences({ sms_staff_assignments: checked })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Digests & Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle
                title="Daily Summary"
                description="Daily digest of events and activity"
                defaultChecked={prefs?.digest_daily ?? false}
                onChange={(checked) => updateUserPreferences({ digest_daily: checked })}
              />
              <NotificationToggle
                title="Weekly Report"
                description="Weekly performance summary"
                defaultChecked={prefs?.digest_weekly ?? false}
                onChange={(checked) => updateUserPreferences({ digest_weekly: checked })}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "support" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-warm-sand mb-4">Have a question or need help? Send us a message.</p>
              <SupportForm />
            </CardContent>
          </Card>

          {tickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-warm-sand/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-olive-gold/20 text-olive-gold">{ticket.category}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ticket.status === "open" ? "bg-green-500/20 text-green-400" : 
                        ticket.status === "resolved" ? "bg-blue-500/20 text-blue-400" : 
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>{ticket.status}</span>
                    </div>
                    <h4 className="text-warm-white font-medium">{ticket.subject}</h4>
                    <p className="text-warm-sand/60 text-sm mt-1">
                      {new Date(ticket.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Other Ways to Reach Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-olive-gold" />
                <div>
                  <p className="text-warm-white font-medium">Email</p>
                  <p className="text-warm-sand text-sm">ontap.inquiries@gmail.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}