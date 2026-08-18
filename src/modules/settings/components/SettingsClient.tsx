"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from "@/ui/primitives";
import {
  Bell, User, Lock, Mail, LogOut, HelpCircle, AlertTriangle, CreditCard, Download, Calendar, Copy, Check,
  ExternalLink, Globe, Shield, ShieldCheck, KeyRound, Fingerprint, MonitorSmartphone, Building2, ArrowRight,
  Sparkles, Clock, Send, MessageSquare, CircleDollarSign, UserCircle, PhoneCall, Save, Loader2, FileText, BarChart,
} from "lucide-react";
import { SignOutButton, useClerk } from "@clerk/nextjs";
import { deleteUserAccount } from "@/lib/auth/actions";
import { updateUserPreferences, UserPreferences } from "@/lib/preferences/actions";
import { submitSupportTicket } from "@/lib/support/actions";
import { createStripeConnectLink, disconnectStripe } from "@/modules/settings/actions/stripe-connect";
import { exportInvoicesCSV } from "@/modules/billing/actions/export";
import { updateOrgSlug, updatePackageBookingVisibility, updateUserName } from "@/modules/settings/actions/settings";

function SectionCard({ icon: Icon, title, description, children, className = "" }: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-olive-gold/20 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-olive-gold" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

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
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-green-400" />
        </div>
        <p className="text-warm-white font-semibold text-lg">Message Sent!</p>
        <p className="text-warm-sand text-sm mt-1">We&apos;ll get back to you soon.</p>
        <button
          onClick={() => setSent(false)}
          className="text-olive-gold text-sm mt-4 font-medium hover:underline"
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
          className="w-full px-3 py-2.5 rounded-lg bg-charcoal border border-warm-sand/20 text-warm-white focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold"
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
          className="w-full px-3 py-2.5 rounded-lg bg-charcoal border border-warm-sand/20 text-warm-white placeholder:text-warm-sand/50 focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold resize-none"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button type="submit" disabled={sending} className="w-full" size="sm">
        {sending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
        ) : (
          <><Send className="w-4 h-4" /> Send Message</>
        )}
      </Button>
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
      <SectionCard
        icon={Globe}
        title="Booking Link"
        description="Share this link anywhere you promote your services. Customers can book without an account."
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
              bookingEnabled ? "bg-green-500/15 border border-green-500/40 text-green-400" : "bg-warm-sand/10 border border-warm-sand/30 text-warm-sand"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${bookingEnabled ? "bg-green-400" : "bg-warm-sand/60"}`} />
              {bookingEnabled ? "Live" : "Off"}
            </span>
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
            {bookingEnabled
              ? "Your booking page is live."
              : "Turn on online bookings from your Events page to make this link accessible."}
          </p>
        </div>
      </SectionCard>

      <SectionCard
        icon={Calendar}
        title="Customize Your Link"
        description="Pick a short, memorable link that matches your business name."
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-warm-sand">
            <span className="shrink-0">{appUrl}/book/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugError(""); setSlugSuccess(false); }}
              placeholder="your-bar-name"
              className="flex-1 bg-charcoal border border-warm-sand/20 rounded-lg px-3 py-2 text-warm-white text-sm focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold"
            />
          </div>
          {slugError && <p className="text-sm text-red-400">{slugError}</p>}
          {slugSuccess && <p className="text-sm text-green-400 flex items-center gap-1"><Check className="w-4 h-4" /> Link updated!</p>}
          <Button
            onClick={handleSaveSlug}
            disabled={slugSaving || !slug.trim() || slug === orgSlug}
            size="sm"
            variant="secondary"
          >
            {slugSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save</>
            )}
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        icon={Sparkles}
        title="Packages on Booking Page"
        description="Toggle which packages appear on your public booking page."
      >
        {packages.length === 0 ? (
          <p className="text-warm-sand text-sm p-4 bg-warm-sand/5 rounded-lg text-center">
            No packages yet. Create packages in your profile settings.
          </p>
        ) : (
          <div className="space-y-3">
            {packages.map(pkg => {
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
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function NotificationToggle({
  icon: Icon,
  title,
  description,
  defaultChecked = false,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void | Promise<unknown>;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = async (value: boolean) => {
    setChecked(value);
    setSaving(true);
    setSaved(false);
    try {
      await onChange?.(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-warm-sand/5 rounded-lg hover:bg-warm-sand/10 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-olive-gold/15 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-olive-gold" />
        </div>
        <div>
          <h4 className="text-warm-white font-medium">{title}</h4>
          <p className="text-warm-sand text-sm">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {saving && <Loader2 className="w-4 h-4 text-olive-gold animate-spin" />}
        {saved && !saving && <span className="text-xs text-green-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Saved</span>}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            className="sr-only peer"
            onChange={(e) => handleChange(e.target.checked)}
          />
          <div className="w-11 h-6 bg-warm-sand/20 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-olive-gold rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-warm-sand after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-olive-gold peer-checked:after:bg-charcoal"></div>
        </label>
      </div>
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create Stripe Connect link. Please try again.";
      alert(message);
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
  userFirstName?: string | null;
  userLastName?: string | null;
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
  orgName?: string | null;
  orgLogoUrl?: string | null;
  bookingEnabled?: boolean;
  packages?: Package_[];
  stripeConnectStatus?: { connected: boolean; status: string | null; accountId?: string | null };
  subscriptionStatus?: {
    status: string;
    periodEnd?: string;
    subscriberCount?: number;
  };
}

function subscriptionBadge(status?: string) {
  switch (status) {
    case "active":
      return { label: "Active", variant: "success" as const };
    case "trialing":
      return { label: "Trial", variant: "success" as const };
    case "past_due":
      return { label: "Past Due", variant: "warning" as const };
    case "canceled":
    case "unpaid":
      return { label: "Canceled", variant: "destructive" as const };
    default:
      return { label: "Inactive", variant: "secondary" as const };
  }
}

export function SettingsClient({
  userEmail, userFirstName, userLastName, emailVerified, preferences, tickets = [],
  orgId, orgSlug, orgName, orgLogoUrl, bookingEnabled = false, packages = [],
  stripeConnectStatus, subscriptionStatus,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState("account");
  const [deleting, setDeleting] = useState(false);
  const { openUserProfile } = useClerk();

  const [firstName, setFirstName] = useState(userFirstName || "");
  const [lastName, setLastName] = useState(userLastName || "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  const prefs = preferences;

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "booking", label: "Booking", icon: Calendar },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "support", label: "Support", icon: HelpCircle },
  ];

  const subBadge = subscriptionBadge(subscriptionStatus?.status);

  const handleSaveName = async () => {
    setNameError("");
    setNameSaved(false);
    setNameSaving(true);
    try {
      const result = await updateUserName(firstName.trim(), lastName.trim());
      if (result.success) {
        setNameSaved(true);
        setTimeout(() => setNameSaved(false), 3000);
      } else {
        setNameError(result.error || "Failed to update name");
      }
    } catch {
      setNameError("Something went wrong");
    } finally {
      setNameSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-warm-sand/15 mb-8">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #B2A88A 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-olive-gold/5 to-transparent" />
        <div className="absolute -top-24 -right-16 w-72 h-72 bg-olive-gold/10 rounded-full blur-[80px]" />
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-warm-sand/10 border border-warm-sand/20 px-3 py-1.5 rounded-full mb-4">
                <Sparkles className="w-3.5 h-3.5 text-olive-gold" />
                <span className="text-warm-sand text-xs font-medium">Account &amp; Preferences</span>
              </div>
              <h1 className="text-screen-title text-warm-white">Settings</h1>
              <p className="text-warm-sand mt-1 max-w-xl">
                Manage your account, security, payments, and notifications — all in one place.
              </p>
            </div>
            {subscriptionStatus && (
              <div className="flex items-center gap-3 p-4 bg-charcoal/80 border border-warm-sand/20 rounded-xl backdrop-blur-sm">
                <div className="w-10 h-10 rounded-lg bg-olive-gold/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-olive-gold" />
                </div>
                <div>
                  <p className="text-warm-white font-medium text-sm">OnTap Platform</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={subBadge.variant}>{subBadge.label}</Badge>
                    {subscriptionStatus.status === "active" && subscriptionStatus.periodEnd && (
                      <span className="text-xs text-warm-sand/70">Renews {new Date(subscriptionStatus.periodEnd).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-warm-sand/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-olive-gold text-charcoal shadow-lg shadow-olive-gold/20"
                : "text-warm-sand hover:text-warm-white hover:bg-warm-sand/10"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "account" && (
        <div className="space-y-6 max-w-3xl">
          <SectionCard
            icon={User}
            title="Profile Information"
            description="Your name and email are tied to your OnTap account."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setNameSaved(false); }}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setNameSaved(false); }}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button
                onClick={handleSaveName}
                disabled={nameSaving || (!firstName.trim() && !lastName.trim())}
                size="sm"
              >
                {nameSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Name</>
                )}
              </Button>
              {nameSaved && <span className="text-sm text-green-400 flex items-center gap-1"><Check className="w-4 h-4" /> Name updated!</span>}
              {nameError && <span className="text-sm text-red-400">{nameError}</span>}
            </div>

            <div className="mt-6 pt-6 border-t border-warm-sand/10">
              <label className="label">Email Address</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input defaultValue={userEmail || ""} placeholder="Enter your email" disabled />
                </div>
                <Badge variant={emailVerified ? "success" : "warning"}>
                  {emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              <p className="text-xs text-warm-sand mt-1.5">
                Email is managed securely by Clerk. To change it, use Account Security below.
              </p>
            </div>
          </SectionCard>

          {orgId && (
            <SectionCard
              icon={Building2}
              title="Your Organization"
              description="Business details shown on your public profile and booking page."
            >
              <div className="flex items-center gap-4 p-4 bg-warm-sand/5 rounded-xl border border-warm-sand/15">
                {orgLogoUrl ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-charcoal border border-warm-sand/20 flex items-center justify-center shrink-0">
                    <Image src={orgLogoUrl} alt={orgName || "Logo"} width={56} height={56} className="object-contain" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-olive-gold/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-7 h-7 text-olive-gold" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-warm-white font-semibold truncate">{orgName || "Unnamed Business"}</h4>
                  {orgSlug && (
                    <p className="text-sm text-warm-sand truncate">wereontap.com/profile/{orgSlug}</p>
                  )}
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 text-sm text-olive-gold font-medium hover:text-warm-white transition-colors shrink-0"
                >
                  Manage Profile <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </SectionCard>
          )}

          <SectionCard
            icon={LogOut}
            title="Sign Out"
            description="End your session on this device. You can sign back in anytime."
          >
            <SignOutButton>
              <Button variant="secondary" size="sm">
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </SignOutButton>
          </SectionCard>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6 max-w-3xl">
          <SectionCard
            icon={KeyRound}
            title="Password &amp; Two-Factor Authentication"
            description="Password, 2FA, and sign-in methods are managed securely through Clerk."
          >
            <div className="flex items-center justify-between gap-4 p-4 bg-warm-sand/5 rounded-xl border border-warm-sand/15">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-olive-gold/15 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-olive-gold" />
                </div>
                <div>
                  <h4 className="text-warm-white font-medium">Account Security</h4>
                  <p className="text-warm-sand text-sm mt-0.5">
                    Update your password, enable two-factor authentication, and review active sessions.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openUserProfile()}
                className="shrink-0"
              >
                <KeyRound className="w-4 h-4" /> Manage Security
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            icon={Mail}
            title="Email Verification"
            description="A verified email keeps your account secure and ensures you never miss updates."
          >
            {userEmail ? (
              <div className="flex items-center justify-between gap-4 p-4 bg-warm-sand/5 rounded-xl border border-warm-sand/15">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${emailVerified ? "bg-green-500/15" : "bg-yellow-500/15"}`}>
                    <Mail className={`w-5 h-5 ${emailVerified ? "text-green-400" : "text-yellow-400"}`} />
                  </div>
                  <div>
                    <h4 className="text-warm-white font-medium">{userEmail}</h4>
                    <Badge variant={emailVerified ? "success" : "warning"} className="mt-1">
                      {emailVerified ? "Verified" : "Pending verification"}
                    </Badge>
                  </div>
                </div>
                {!emailVerified && (
                  <Button variant="secondary" size="sm" onClick={() => openUserProfile()}>
                    Verify Email
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-warm-sand text-sm">No email found on this account.</p>
            )}
          </SectionCard>

          <SectionCard
            icon={MonitorSmartphone}
            title="Active Sessions"
            description="See which devices are signed in and revoke access remotely."
          >
            <div className="flex items-center justify-between gap-4 p-4 bg-warm-sand/5 rounded-xl border border-warm-sand/15">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-olive-gold/15 flex items-center justify-center shrink-0">
                  <MonitorSmartphone className="w-5 h-5 text-olive-gold" />
                </div>
                <div>
                  <h4 className="text-warm-white font-medium">Review Devices</h4>
                  <p className="text-warm-sand text-sm mt-0.5">
                    View and manage every device signed in to your account.
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => openUserProfile()} className="shrink-0">
                Manage Sessions
              </Button>
            </div>
          </SectionCard>

          <Card className="border-red-500/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-red-400">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions for your account.</CardDescription>
                </div>
              </div>
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
        <div className="space-y-6 max-w-3xl">
          <SectionCard
            icon={CircleDollarSign}
            title="Stripe Connect"
            description="Connect Stripe to accept online payments from clients."
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-xl border border-warm-sand/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-olive-gold/15 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-olive-gold" />
                  </div>
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
                <Badge variant={stripeConnectStatus?.connected ? "success" : stripeConnectStatus?.status === "pending" ? "warning" : "secondary"}>
                  {stripeConnectStatus?.connected ? "Connected" : stripeConnectStatus?.status === "pending" ? "Pending" : "Not Connected"}
                </Badge>
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
          </SectionCard>

          <SectionCard
            icon={ShieldCheck}
            title="Platform Subscription"
            description="Your access to the OnTap platform."
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-xl border border-warm-sand/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-olive-gold/15 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-olive-gold" />
                  </div>
                  <div>
                    <h4 className="text-warm-white font-medium">OnTap Platform</h4>
                    <p className="text-warm-sand text-sm">
                      {subscriptionStatus?.status === "active"
                        ? `Active — renews ${subscriptionStatus.periodEnd ? new Date(subscriptionStatus.periodEnd).toLocaleDateString() : ""}`
                        : subscriptionStatus?.status === "past_due"
                        ? "Payment past due — update your billing info to keep access"
                        : "Subscribe to access the OnTap platform"}
                    </p>
                  </div>
                </div>
                <Badge variant={subBadge.variant}>{subBadge.label}</Badge>
              </div>

              <SubscriptionActions orgId={orgId} status={subscriptionStatus?.status} />

              {subscriptionStatus?.subscriberCount !== undefined && (
                <div className="flex items-center justify-between p-3 bg-olive-gold/10 rounded-lg border border-olive-gold/20">
                  <p className="text-sm text-warm-sand">Active subscribers</p>
                  <p className="text-sm font-bold text-olive-gold">{subscriptionStatus.subscriberCount} / 500</p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            icon={CircleDollarSign}
            title="Payout Settings"
            description="How funds are settled to your account."
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-xl">
                <div>
                  <h4 className="text-warm-white font-medium">Platform Fee</h4>
                  <p className="text-warm-sand text-sm">No platform fee is currently applied. 100% of each payment settles to your Stripe account (minus standard Stripe processing fees).</p>
                </div>
                <span className="text-olive-gold font-medium shrink-0 ml-4">0%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-xl">
                <div>
                  <h4 className="text-warm-white font-medium">Settlement Timing</h4>
                  <p className="text-warm-sand text-sm">Funds settle directly to your Stripe account. Typically available within 2 business days.</p>
                </div>
                <span className="text-warm-sand text-sm shrink-0 ml-4 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> 2-3 days
                </span>
              </div>
            </div>
          </SectionCard>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-olive-gold/20 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-olive-gold" />
                </div>
                <div>
                  <CardTitle>Record Keeping &amp; Responsibility</CardTitle>
                  <CardDescription>Stay compliant as the merchant of record.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-warm-sand text-sm">
                As the merchant of record, you are responsible for maintaining records of all transactions processed through your Stripe account. This includes invoices, payments, refunds, and chargebacks.
              </p>
              <div className="p-4 bg-olive-gold/10 rounded-xl border border-olive-gold/20">
                <h4 className="text-warm-white font-medium text-sm mb-3">Your Responsibilities</h4>
                <ul className="text-warm-sand text-sm space-y-2.5">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-olive-gold mt-0.5 shrink-0" /> Download and store copies of paid invoices for your records</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-olive-gold mt-0.5 shrink-0" /> Handle refunds and disputes directly through your Stripe dashboard</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-olive-gold mt-0.5 shrink-0" /> Report and remit applicable taxes for your transactions</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-olive-gold mt-0.5 shrink-0" /> Retain transaction records as required by your local regulations</li>
                </ul>
              </div>
              <p className="text-warm-sand/60 text-xs">
                OnTap is a service platform and is not responsible for your record-keeping or tax obligations.
              </p>
              <div className="pt-1">
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
        <div className="space-y-6 max-w-3xl">
          <SectionCard
            icon={Bell}
            title="Email Notifications"
            description="Choose which updates land in your inbox."
          >
            <div className="space-y-3">
              <NotificationToggle
                icon={UserCircle}
                title="New Leads"
                description="Get notified when new contacts are added"
                defaultChecked={prefs?.email_new_leads ?? true}
                onChange={(checked) => updateUserPreferences({ email_new_leads: checked })}
              />
              <NotificationToggle
                icon={FileText}
                title="Quote Updates"
                description="Updates on quotes sent to clients"
                defaultChecked={prefs?.email_quote_updates ?? true}
                onChange={(checked) => updateUserPreferences({ email_quote_updates: checked })}
              />
              <NotificationToggle
                icon={Fingerprint}
                title="Contract Signatures"
                description="When contracts are signed"
                defaultChecked={prefs?.email_contract_signatures ?? true}
                onChange={(checked) => updateUserPreferences({ email_contract_signatures: checked })}
              />
              <NotificationToggle
                icon={CircleDollarSign}
                title="Payment Received"
                description="Invoice payments and deposits"
                defaultChecked={prefs?.email_payment_received ?? true}
                onChange={(checked) => updateUserPreferences({ email_payment_received: checked })}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={MessageSquare}
            title="SMS Alerts"
            description="Important updates sent straight to your phone."
          >
            <div className="space-y-3">
              <NotificationToggle
                icon={AlertTriangle}
                title="Urgent Events"
                description="Urgent updates requiring immediate attention"
                defaultChecked={prefs?.sms_urgent_events ?? true}
                onChange={(checked) => updateUserPreferences({ sms_urgent_events: checked })}
              />
              <NotificationToggle
                icon={UserCircle}
                title="Staff Assignments"
                description="When staff are assigned to events"
                defaultChecked={prefs?.sms_staff_assignments ?? false}
                onChange={(checked) => updateUserPreferences({ sms_staff_assignments: checked })}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Calendar}
            title="Digests &amp; Reports"
            description="Periodic summaries of your business activity."
          >
            <div className="space-y-3">
              <NotificationToggle
                icon={Clock}
                title="Daily Summary"
                description="Daily digest of events and activity"
                defaultChecked={prefs?.digest_daily ?? false}
                onChange={(checked) => updateUserPreferences({ digest_daily: checked })}
              />
              <NotificationToggle
                icon={BarChart}
                title="Weekly Report"
                description="Weekly performance summary"
                defaultChecked={prefs?.digest_weekly ?? false}
                onChange={(checked) => updateUserPreferences({ digest_weekly: checked })}
              />
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === "support" && (
        <div className="space-y-6 max-w-3xl">
          <SectionCard
            icon={MessageSquare}
            title="Contact Support"
            description="Have a question or need help? Send us a message."
          >
            <SupportForm />
          </SectionCard>

          {tickets.length > 0 && (
            <SectionCard
              icon={HelpCircle}
              title="Your Tickets"
              description="A history of everything you&apos;ve sent us."
            >
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-warm-sand/5 rounded-xl border border-warm-sand/10">
                    <div className="flex items-center justify-between mb-2">
                      <Badge>{ticket.category}</Badge>
                      <Badge variant={
                        ticket.status === "open" ? "success" :
                        ticket.status === "resolved" ? "default" : "warning"
                      }>
                        {ticket.status}
                      </Badge>
                    </div>
                    <h4 className="text-warm-white font-medium">{ticket.subject}</h4>
                    <p className="text-warm-sand/60 text-sm mt-1">
                      {new Date(ticket.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard
            icon={PhoneCall}
            title="Other Ways to Reach Us"
            description="Prefer email? Reach us directly."
          >
            <div className="flex items-center gap-3 p-4 bg-warm-sand/5 rounded-xl border border-warm-sand/15">
              <div className="w-10 h-10 rounded-lg bg-olive-gold/15 flex items-center justify-center">
                <Mail className="w-5 h-5 text-olive-gold" />
              </div>
              <div>
                <p className="text-warm-white font-medium">Email</p>
                <a href="mailto:ontap.inquiries@gmail.com" className="text-sm text-olive-gold hover:text-warm-white transition-colors">
                  ontap.inquiries@gmail.com
                </a>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}