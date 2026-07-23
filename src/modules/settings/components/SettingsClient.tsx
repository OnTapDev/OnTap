"use client";

import { useState } from "react";
import { Input, Card, CardHeader, CardTitle, CardContent, Button } from "@/ui/primitives";
import { Bell, User, Lock, Mail, LogOut, HelpCircle, AlertTriangle, CreditCard, Download, Calendar, Copy, Check, ExternalLink, Eye, EyeOff, Globe } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { deleteUserAccount } from "@/lib/auth/actions";
import { updateUserPreferences, UserPreferences } from "@/lib/preferences/actions";
import { submitSupportTicket } from "@/lib/support/actions";
import { createStripeConnectLink, disconnectStripe } from "@/modules/settings/actions/stripe-connect";
import { exportInvoicesCSV } from "@/modules/billing/actions/export";
import { updateOrgSlug, updateBookingEnabled, updatePackageBookingVisibility } from "@/modules/settings/actions/settings";

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

function BookingTabContent({ orgId, orgSlug, bookingEnabled, packages }: {
  orgId?: string;
  orgSlug?: string;
  bookingEnabled: boolean;
  packages: Package_[];
}) {
  const [slug, setSlug] = useState(orgSlug || "");
  const [slugError, setSlugError] = useState("");
  const [slugSaving, setSlugSaving] = useState(false);
  const [slugSuccess, setSlugSuccess] = useState(false);
  const [bookingOn, setBookingOn] = useState(bookingEnabled);
  const [bookingToggling, setBookingToggling] = useState(false);
  const [packageVisibilities, setPackageVisibilities] = useState<Record<string, boolean>>(
    Object.fromEntries(packages.map(p => [p.id, p.show_on_booking ?? true]))
  );
  const [pkgToggling, setPkgToggling] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "https://wereontap.com";
  const bookingUrl = `${appUrl}/book/${orgSlug || slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = bookingUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveSlug = async () => {
    if (!orgId) return;
    setSlugError("");
    setSlugSuccess(false);
    setSlugSaving(true);
    try {
      const result = await updateOrgSlug(orgId, slug);
      setSlug(result.slug);
      setSlugSuccess(true);
      setTimeout(() => setSlugSuccess(false), 3000);
    } catch (err) {
      setSlugError(err instanceof Error ? err.message : "Failed to update slug");
    } finally {
      setSlugSaving(false);
    }
  };

  const handleToggleBooking = async () => {
    if (!orgId) return;
    setBookingToggling(true);
    try {
      const result = await updateBookingEnabled(orgId, !bookingOn);
      setBookingOn(result.enabled);
    } catch {
      // revert on error
    } finally {
      setBookingToggling(false);
    }
  };

  const handleTogglePackage = async (pkgId: string) => {
    setPkgToggling(prev => new Set(prev).add(pkgId));
    const newVal = !packageVisibilities[pkgId];
    try {
      await updatePackageBookingVisibility(pkgId, newVal);
      setPackageVisibilities(prev => ({ ...prev, [pkgId]: newVal }));
    } catch {
      // revert on error
    } finally {
      setPkgToggling(prev => {
        const next = new Set(prev);
        next.delete(pkgId);
        return next;
      });
    }
  };

  if (!orgId) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-warm-sand text-sm">
            Share this link on social media, your website, or anywhere you promote your services.
            Customers can book without creating an account.
          </p>
          <div className="flex items-center gap-2 p-3 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
            <Globe className="w-4 h-4 text-olive-gold shrink-0" />
            <code className="flex-1 text-sm text-warm-white truncate">{bookingUrl}</code>
            <button
              onClick={handleCopyLink}
              className="shrink-0 p-2 text-warm-sand hover:text-olive-gold transition-colors rounded-lg hover:bg-warm-sand/10"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-2 text-warm-sand hover:text-olive-gold transition-colors rounded-lg hover:bg-warm-sand/10"
              title="Preview"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-warm-sand/60">
            {bookingOn ? "Your booking page is live." : "Enable booking below to make this page accessible."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Page Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
            <div className="flex items-center gap-3">
              {bookingOn ? <Eye className="w-5 h-5 text-green-400" /> : <EyeOff className="w-5 h-5 text-warm-sand" />}
              <div>
                <h4 className="text-warm-white font-medium">Public Booking</h4>
                <p className="text-warm-sand text-sm">
                  {bookingOn ? "Customers can book via your public link" : "Public booking is disabled"}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleBooking}
              disabled={bookingToggling}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                bookingOn ? "bg-olive-gold" : "bg-warm-sand/30"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                bookingOn ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customize Your Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-warm-sand mb-2">
            <Globe className="w-4 h-4" />
            <span>{appUrl}/book/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugError(""); setSlugSuccess(false); }}
              placeholder="your-bar-name"
              className="flex-1 bg-charcoal border border-warm-sand/20 rounded-lg px-3 py-1.5 text-warm-white text-sm focus:border-olive-gold focus:outline-none"
            />
          </div>
          {slugError && <p className="text-sm text-red-400">{slugError}</p>}
          {slugSuccess && <p className="text-sm text-green-400">Link updated!</p>}
          <Button
            onClick={handleSaveSlug}
            disabled={slugSaving || !slug.trim() || slug === orgSlug}
            size="sm"
          >
            {slugSaving ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Packages on Booking Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-warm-sand text-sm mb-2">Toggle which packages appear on your public booking page.</p>
          {packages.length === 0 ? (
            <p className="text-warm-sand text-sm p-4 bg-warm-sand/5 rounded-lg text-center">
              No packages yet. Create packages in your profile settings.
            </p>
          ) : (
            packages.map(pkg => {
              const visible = packageVisibilities[pkg.id] ?? true;
              const toggling = pkgToggling.has(pkg.id);
              return (
                <div key={pkg.id} className="flex items-center justify-between p-3 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
                  <div>
                    <h4 className="text-warm-white font-medium text-sm">{pkg.name}</h4>
                    <p className="text-xs text-warm-sand">${pkg.base_price} / {pkg.pricing_type === "per_guest" ? "guest" : pkg.pricing_type}</p>
                  </div>
                  <button
                    onClick={() => handleTogglePackage(pkg.id)}
                    disabled={toggling}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      visible ? "bg-olive-gold" : "bg-warm-sand/30"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      visible ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
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

function SubscriptionActions({ orgId, status }: { orgId?: string; status?: string }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-subscription-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { alert(data.error || "Failed to create subscription"); }
    } catch { alert("Failed to start subscription"); }
    finally { setLoading(false); }
  };

  const handleManage = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { alert(data.error || "Failed to open billing portal"); }
    } catch { alert("Failed to open billing portal"); }
    finally { setLoading(false); }
  };

  if (status === "active" || status === "past_due") {
    return (
      <button onClick={handleManage} disabled={loading}
        className="btn-secondary text-sm flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        {loading ? "Loading..." : "Manage Billing"}
      </button>
    );
  }

  return (
    <button onClick={handleSubscribe} disabled={loading}
      className="btn-primary text-sm flex items-center gap-2">
      <CreditCard className="w-4 h-4" />
      {loading ? "Redirecting..." : "Subscribe Now"}
    </button>
  );
}

function StripeConnectButton({ orgId }: { orgId?: string }) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const result = await createStripeConnectLink(orgId);
      if (result.url) {
        window.location.href = result.url;
      } else if (result.status === "complete") {
        window.location.reload();
      }
    } catch {
      alert("Failed to create Stripe Connect link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="btn-primary flex items-center gap-2"
    >
      <CreditCard className="w-4 h-4" />
      {loading ? "Redirecting to Stripe..." : "Connect with Stripe"}
    </button>
  );
}

type Package_ = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  pricing_type: string;
  is_active: boolean;
  show_on_booking: boolean | null;
};

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
  orgId?: string;
  orgSlug?: string;
  bookingEnabled?: boolean;
  packages?: Package_[];
  stripeConnectStatus?: { connected: boolean; status: string | null; accountId?: string | null };
  subscriptionStatus?: {
    status: string;
    periodEnd?: string;
    subscriberCount?: number;
  };
}

export function SettingsClient({ userEmail, emailVerified, preferences, tickets = [], orgId, orgSlug, bookingEnabled = false, packages = [], stripeConnectStatus, subscriptionStatus }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState("account");
  const [deleting, setDeleting] = useState(false);

  const prefs = preferences;

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "booking", label: "Booking", icon: Calendar },
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

      {activeTab === "payments" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-lg">
                <div className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-olive-gold" />
                    <div>
                      <h4 className="text-warm-white font-medium">Receive Payments</h4>
                      <p className="text-warm-sand text-sm">
                        {stripeConnectStatus?.connected
                          ? "Your Stripe account is connected. Payments will be deposited to your account."
                          : stripeConnectStatus?.status === "pending"
                          ? "Onboarding in progress. Complete the Stripe setup to start receiving payments."
                          : "Connect your Stripe account to accept online payments from clients."}
                      </p>
                    </div>
                  </div>
                </div>

                {!stripeConnectStatus?.connected ? (
                  <StripeConnectButton orgId={orgId} />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      Connected — {stripeConnectStatus.accountId?.slice(0, 10)}...
                    </div>
                    <button
                      onClick={async () => {
                        if (!orgId) return;
                        if (!window.confirm("Disconnect Stripe? You won't be able to accept payments until you reconnect.")) return;
                        await disconnectStripe(orgId);
                        window.location.reload();
                      }}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Disconnect Stripe
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-lg">
                <div className="flex items-center gap-3 p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
                  <CreditCard className="w-8 h-8 text-olive-gold" />
                  <div className="flex-1">
                    <h4 className="text-warm-white font-medium">OnTap Platform</h4>
                    <p className="text-warm-sand text-sm">
                      {subscriptionStatus?.status === "active"
                        ? `Active — renews ${subscriptionStatus.periodEnd ? new Date(subscriptionStatus.periodEnd).toLocaleDateString() : ""}`
                        : subscriptionStatus?.status === "past_due"
                        ? "Payment past due — update your billing info to keep access"
                        : "Subscribe to access the OnTap platform"}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${subscriptionStatus?.status === "active" ? "text-green-400" : subscriptionStatus?.status === "past_due" ? "text-red-400" : "text-warm-sand"}`}>
                    {subscriptionStatus?.status === "active" ? "Active" : subscriptionStatus?.status === "past_due" ? "Past Due" : "Inactive"}
                  </span>
                </div>

                <SubscriptionActions orgId={orgId} status={subscriptionStatus?.status} />

                {subscriptionStatus?.subscriberCount !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-olive-gold/10 rounded-lg border border-olive-gold/20">
                    <p className="text-sm text-warm-sand">Active subscribers</p>
                    <p className="text-sm font-bold text-olive-gold">{subscriptionStatus.subscriberCount} / 500</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-lg">
                <div className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-lg">
                  <div>
                    <h4 className="text-warm-white font-medium">Platform Fee</h4>
                    <p className="text-warm-sand text-sm">No platform fee is currently applied. 100% of each payment settles to your Stripe account (minus standard Stripe processing fees).</p>
                  </div>
                  <span className="text-olive-gold font-medium">0%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-lg">
                  <div>
                    <h4 className="text-warm-white font-medium">Settlement Timing</h4>
                    <p className="text-warm-sand text-sm">Funds settle directly to your Stripe account. Typically available within 2 business days.</p>
                  </div>
                  <span className="text-warm-sand text-sm">2-3 days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warm-sand/20">
            <CardHeader>
              <CardTitle>Record Keeping & Responsibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <p className="text-warm-sand text-sm">
                As the merchant of record, you are responsible for maintaining records of all transactions processed through your Stripe account. This includes invoices, payments, refunds, and chargebacks.
              </p>
              <div className="p-4 bg-olive-gold/10 rounded-lg border border-olive-gold/20">
                <h4 className="text-warm-white font-medium text-sm mb-2">Your Responsibilities</h4>
                <ul className="text-warm-sand text-sm space-y-2">
                  <li className="flex items-start gap-2">• Download and store copies of paid invoices for your records</li>
                  <li className="flex items-start gap-2">• Handle refunds and disputes directly through your Stripe dashboard</li>
                  <li className="flex items-start gap-2">• Report and remit applicable taxes for your transactions</li>
                  <li className="flex items-start gap-2">• Retain transaction records as required by your local regulations</li>
                </ul>
              </div>
              <p className="text-warm-sand/60 text-xs">
                OnTap is a service platform and is not responsible for your record-keeping or tax obligations.
              </p>
              <div className="pt-2">
                <button
                  onClick={async () => {
                    if (!orgId) return;
                    const csv = await exportInvoicesCSV(orgId);
                    if (!csv) { alert("No invoices to export."); return; }
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `invoices-export-${new Date().toISOString().split("T")[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Invoice Records (CSV)
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "booking" && (
        <BookingTabContent orgId={orgId} orgSlug={orgSlug} bookingEnabled={bookingEnabled} packages={packages} />
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