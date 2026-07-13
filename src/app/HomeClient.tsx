"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar,
  FileText,
  DollarSign,
  Check,
  Send,
  ArrowRight,
  Sparkles,
  Zap,
  Heart,
  Shield,
  Star,
  Building2,
  ScrollText,
} from "lucide-react";
import { createWaitlistEntry } from "@/modules/public/actions/waitlist";

const STEPS = [
  {
    icon: Calendar,
    title: "Book without the back-and-forth",
    description: "Calendar syncs with your CRM so every inquiry lands in one place. No more losing leads to buried Instagram DMs or forgotten voicemails.",
    features: ["Calendar widget for instant availability", "Contact profiles with full history", "Automated booking reminders"],
  },
  {
    icon: FileText,
    title: "Send proposals that close",
    description: "Stop emailing screenshots of your pricing. Send polished quotes, contracts, and e-signatures from your phone — and get signed in minutes, not days.",
    features: ["Professional quotes in 30 seconds", "Built-in e-signatures", "Reusable contract templates"],
  },
  {
    icon: DollarSign,
    title: "Get paid without chasing",
    description: "Invoices go out automatically when a contract is signed. Deposits, payment tracking, and overdue reminders — so you focus on pouring drinks, not following up.",
    features: ["Auto-invoicing on signed contracts", "Deposit collection at booking", "Payment status at a glance"],
  },
];

interface HomeClientProps {
  availableSpots: number;
}

export function HomeClient({ availableSpots: initialSpots }: HomeClientProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(initialSpots);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError("");
    try {
      await createWaitlistEntry(email);
      setSubmitted(true);
      setSpotsLeft(prev => Math.max(0, prev - 1));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to join waitlist";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const spotsText = spotsLeft === 0 
    ? "Waitlist only" 
    : spotsLeft === 1 
      ? "1 spot left" 
      : `${spotsLeft} spots left`;

  return (
    <main className="min-h-screen bg-charcoal">
      {/* Maintenance Banner */}
      <div className="bg-olive-gold/10 border-b border-olive-gold/20 px-4 py-2 text-center">
        <p className="text-sm text-olive-gold">
          We&apos;re currently working on sign-up and sign-in issues. Thanks for your patience.
        </p>
      </div>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-charcoal/90 backdrop-blur-md border-b border-warm-sand/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <Link href="/" className="relative h-10 w-28 md:h-12 md:w-40 flex-shrink-0">
            <Image 
              src="/images/svg/horizontal_lockup.svg" 
              alt="OnTap" 
              fill
              className="object-contain"
            />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-warm-sand hover:text-warm-white text-sm transition-colors">How It Works</a>
            <a href="#pricing" className="text-warm-sand hover:text-warm-white text-sm transition-colors">Pricing</a>
            <a href="#resources" className="text-warm-sand hover:text-warm-white text-sm transition-colors">Resources</a>
            <a href="#waitlist" className="text-warm-sand hover:text-warm-white text-sm transition-colors">Contact</a>
          </nav>

          <button 
            onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-olive-gold text-charcoal px-4 py-2 rounded-lg text-sm font-medium hover:bg-olive-gold/90 transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #B2A88A 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-olive-gold/5 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-olive-gold/10 rounded-full blur-[80px] md:blur-[120px]" />
        
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-32 w-full">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-warm-sand/10 px-3 py-2 md:px-4 md:py-2 rounded-full mb-6 md:mb-8">
              <span className="w-2 h-2 bg-olive-gold rounded-full animate-pulse" />
              <span className="text-warm-sand text-sm">Now accepting founding members</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-warm-white mb-4 md:mb-6 leading-tight">
              Stop running your bar business<br />
              <span className="text-olive-gold">out of a notes app</span>
            </h1>
            
            <p className="text-base md:text-xl text-warm-sand/80 max-w-2xl mx-auto mb-8 md:mb-12">
              OnTap is the OS for mobile bar operators. CRM, quotes, contracts, invoicing, 
              calendar, and client messaging — all in one place, built for how you actually work.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Link 
                href="/sign-up" 
                className="inline-flex items-center justify-center gap-2 bg-olive-gold text-charcoal px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:bg-olive-gold/90 transition-colors"
              >
                Get Founding Access
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/sign-in" 
                className="inline-flex items-center justify-center gap-2 border border-warm-sand/30 text-warm-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:border-olive-gold hover:text-olive-gold transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-charcoal" />
      </section>

      {/* How It Works — 3 narrative sections */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-warm-white mb-3 md:mb-4">
              Built for the chaos of running a mobile bar
            </h2>
            <p className="text-warm-sand/80 text-base md:text-lg max-w-2xl mx-auto">
              From the first DM to the final invoice, OnTap keeps your business running smooth.
            </p>
          </div>

          <div className="space-y-16 md:space-y-24">
            {STEPS.map((step, i) => (
              <div 
                key={step.title}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
              >
                <div className={`${i % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="w-48 h-48 md:w-56 md:h-56 mx-auto rounded-2xl border border-warm-sand/10 bg-gradient-to-br from-olive-gold/15 to-charcoal flex items-center justify-center">
                    <step.icon className="w-16 h-16 md:w-20 md:h-20 text-olive-gold/80" />
                  </div>
                </div>

                <div className={`${i % 2 === 1 ? 'md:order-1' : ''}`}>
                  <div className="inline-flex items-center gap-2 bg-olive-gold/10 border border-olive-gold/20 px-3 py-1.5 rounded-full mb-4">
                    <span className="text-olive-gold text-sm font-medium">Step {i + 1}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-warm-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-warm-sand/80 mb-5 text-base md:text-lg leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="space-y-2 md:space-y-3">
                    {step.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-warm-sand">
                        <Check className="w-4 h-4 text-olive-gold flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDING PRICING */}
      <section className="py-16 md:py-24 border-t border-warm-sand/10 bg-gradient-to-b from-charcoal via-olive-gold/[0.03] to-charcoal">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-olive-gold/20 border border-olive-gold/40 px-3 md:px-4 py-2 rounded-full mb-4 md:mb-6">
              <Sparkles className="w-4 h-4 text-olive-gold" />
              <span className="text-olive-gold text-sm font-medium">Founding Member Pricing</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-warm-white mb-3 md:mb-4">
              Lock In $20/Month — <span className="text-olive-gold">Forever</span>
            </h2>
            <p className="text-base md:text-xl text-warm-sand/80 max-w-xl md:max-w-2xl mx-auto">
              Get the full Professional tier for $20/month. This rate is locked permanently — even at full launch.
            </p>
          </div>

          <div className="max-w-md mx-auto px-2 md:px-0">
            <div className="relative p-6 md:p-8 rounded-2xl border-2 border-olive-gold bg-charcoal shadow-2xl shadow-olive-gold/20">
              <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-olive-gold text-charcoal px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold">
                {spotsText}
              </div>
              
              <div className="text-center mb-6 md:mb-8">
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white">$20</span>
                  <span className="text-warm-sand text-xl">/mo</span>
                </div>
                <div className="bg-olive-gold/10 border border-olive-gold/20 inline-block px-3 md:px-4 py-2 rounded-lg">
                  <p className="text-olive-gold font-bold text-sm md:text-base">Save $360/year</p>
                  <p className="text-warm-sand text-xs md:text-sm">vs $50/month at launch</p>
                </div>
              </div>

              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {["Unlimited contacts", "Calendar & scheduling", "Quotes & contracts", "Invoicing & payments", "SMS & email updates", "Public profile page", "Priority support"].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-warm-sand">
                    <Check className="w-4 md:w-5 h-4 md:h-5 text-olive-gold flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="bg-warm-sand/10 border border-warm-sand/20 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <Heart className="w-4 md:w-5 h-4 md:h-5 text-olive-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-warm-white font-medium text-sm">Founding Access = Early Support</p>
                    <p className="text-warm-sand text-xs mt-1">OnTap is still in development. Your membership funds what we&apos;re building now — and in return you lock in the rate and rewards listed above forever.</p>
                  </div>
                </div>
              </div>

              <Link 
                href="/sign-up"
                className="block w-full bg-olive-gold text-charcoal py-3 md:py-4 rounded-lg font-bold text-center hover:bg-olive-gold/90 transition-all hover:scale-[1.02] text-base md:text-lg"
              >
                {spotsLeft > 0 ? "Claim Founding Spot — $20/mo" : "Join Waitlist"}
              </Link>
              
              <p className="text-center text-warm-sand/50 text-xs mt-3">
                After 500 spots: jumps to $50/mo + upgrade required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Coming */}
      <section className="py-16 md:py-24 border-t border-warm-sand/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-warm-sand/10 px-3 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4 text-olive-gold" />
              <span className="text-warm-sand text-sm">Coming Soon</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-warm-white mb-3">
              What&apos;s next for founders
            </h2>
            <p className="text-base md:text-lg text-warm-sand/80">
              Everything below ships at no extra cost as we build toward full launch.
            </p>
            <p className="text-warm-sand/60 text-sm mt-2">
              Some features are still in development — founders get every one the moment they&apos;re ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {[
              { name: "Team Management", desc: "Add staff, manage schedules, assign events" },
              { name: "Advanced Analytics", desc: "Revenue reports, client insights, growth tracking" },
              { name: "SMS Notifications", desc: "Automated reminders to clients" },
              { name: "Email Marketing", desc: "Newsletter & promotional campaigns" },
              { name: "Contract E-Signatures", desc: "Legally binding digital signatures" },
              { name: "Payment Processing", desc: "Accept credit cards, collect deposits online" },
            ].map((feature) => (
              <div key={feature.name} className="p-3 md:p-4 rounded-xl border border-warm-sand/10 bg-warm-sand/5 flex items-start gap-2 md:gap-3">
                <div className="w-2 h-2 rounded-full bg-olive-gold mt-1.5 md:mt-2 flex-shrink-0" />
                <div>
                  <p className="text-warm-white font-medium text-sm md:text-base">{feature.name}</p>
                  <p className="text-warm-sand text-xs md:text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section id="resources" className="py-16 md:py-24 border-t border-warm-sand/10 bg-warm-sand/[0.02]">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-warm-white mb-3">
              Launch Your Mobile Bar Business
            </h2>
            <p className="text-base md:text-lg text-warm-sand/80 max-w-2xl mx-auto">
              Everything you need to go from employee to business owner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-charcoal border border-warm-sand/20 rounded-xl p-5 md:p-6">
              <div className="w-12 h-12 rounded-lg bg-olive-gold/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-olive-gold" />
              </div>
              <h3 className="text-lg font-semibold text-warm-white mb-2">Insurance</h3>
              <p className="text-warm-sand text-sm mb-4">
                Liquor liability and general liability coverage tailored for mobile bartending operations.
              </p>
              <div className="flex flex-wrap gap-2">
                {["CoverWallet", "Thimble", "Hiscox"].map((name) => (
                  <span key={name} className="text-xs px-2.5 py-1.5 bg-warm-sand/10 rounded text-warm-sand border border-warm-sand/10">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-charcoal border border-warm-sand/20 rounded-xl p-5 md:p-6">
              <div className="w-12 h-12 rounded-lg bg-olive-gold/20 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-olive-gold" />
              </div>
              <h3 className="text-lg font-semibold text-warm-white mb-2">Business Formation</h3>
              <p className="text-warm-sand text-sm mb-4">
                LLC, C-Corp, or S-Corp — we help you choose the right structure and get registered fast.
              </p>
              <div className="flex flex-wrap gap-2">
                {["LegalZoom", "Incfile", "Stripe Atlas"].map((name) => (
                  <span key={name} className="text-xs px-2.5 py-1.5 bg-warm-sand/10 rounded text-warm-sand border border-warm-sand/10">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-charcoal border border-warm-sand/20 rounded-xl p-5 md:p-6">
              <div className="w-12 h-12 rounded-lg bg-olive-gold/20 flex items-center justify-center mb-4">
                <ScrollText className="w-6 h-6 text-olive-gold" />
              </div>
              <h3 className="text-lg font-semibold text-warm-white mb-2">Licenses & Permits</h3>
              <p className="text-warm-sand text-sm mb-4">
                Know what&apos;s required in your state — from liquor licenses to catering permits.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2.5 py-1.5 bg-olive-gold/10 rounded text-olive-gold border border-olive-gold/20">State Guides</span>
                <span className="text-xs px-2.5 py-1.5 bg-olive-gold/10 rounded text-olive-gold border border-olive-gold/20">Checklists</span>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-warm-sand/80 text-sm mb-4 max-w-lg mx-auto">
              OnTap is more than software — we&apos;re your partner in building a real business.
            </p>
            <Link 
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-olive-gold text-charcoal px-6 py-3 rounded-lg font-semibold hover:bg-olive-gold/90 transition-colors"
            >
              Start Your Business <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Full Launch Pricing (informational) */}
      <section id="pricing" className="py-16 md:py-24 border-t border-warm-sand/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-warm-white mb-3">
              Launch Pricing
            </h2>
            <p className="text-base md:text-lg text-warm-sand/80">
              Founding members keep their $20 rate permanently. These are the future prices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            <div className="p-5 md:p-6 rounded-2xl border border-warm-sand/15 bg-charcoal">
              <h3 className="text-lg font-semibold text-warm-white">Free</h3>
              <p className="text-3xl font-bold text-warm-white mt-2">$0</p>
              <p className="text-warm-sand text-sm mb-4">/month</p>
              <ul className="space-y-2 text-warm-sand text-sm">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-olive-gold flex-shrink-0" /> Basic calendar</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-olive-gold flex-shrink-0" /> 10 contacts</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-olive-gold flex-shrink-0" /> Public profile</li>
              </ul>
            </div>

            <div className="p-5 md:p-6 rounded-2xl border-2 border-olive-gold bg-charcoal relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-olive-gold text-charcoal px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                Founders pay $20
              </div>
              <h3 className="text-lg font-semibold text-warm-white">Professional</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-warm-white">$50</span>
              </div>
              <p className="text-warm-sand text-sm mb-4">/month at launch</p>
              <ul className="space-y-2 text-warm-sand text-sm">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-olive-gold flex-shrink-0" /> Unlimited contacts</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-olive-gold flex-shrink-0" /> Quotes & contracts</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-olive-gold flex-shrink-0" /> Invoicing</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-olive-gold flex-shrink-0" /> SMS & email</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-olive-gold flex-shrink-0" /> All features</li>
              </ul>
            </div>

            <div className="p-5 md:p-6 rounded-2xl border border-warm-sand/15 bg-charcoal relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-olive-gold text-charcoal px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                Founders pay $80
              </div>
              <h3 className="text-lg font-semibold text-warm-white">Enterprise</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-warm-white">$200</span>
              </div>
              <p className="text-warm-sand text-sm mb-4">/month at launch</p>
              <ul className="space-y-2 text-warm-sand text-sm">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-olive-gold flex-shrink-0" /> Unlimited team seats</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-olive-gold flex-shrink-0" /> Team permissions</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-olive-gold flex-shrink-0" /> Multi-location</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-olive-gold flex-shrink-0" /> Custom branding</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-olive-gold flex-shrink-0" /> API access</li>
              </ul>
            </div>
          </div>

          {/* Marketplace Fee */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="bg-warm-sand/5 rounded-xl p-5 md:p-6 text-center">
              <h3 className="text-base md:text-lg font-semibold text-warm-white mb-2">Marketplace Fee</h3>
              <p className="text-warm-sand/80 mb-4 text-sm">Platform fee on bookings (not subscription):</p>
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                <div className="bg-charcoal rounded-lg p-3 border border-warm-sand/10"><p className="text-xl font-bold text-olive-gold">5%</p><p className="text-warm-sand text-xs">$50K+/year</p></div>
                <div className="bg-charcoal rounded-lg p-3 border border-warm-sand/10"><p className="text-xl font-bold text-olive-gold">7%</p><p className="text-warm-sand text-xs">$20K-50K/year</p></div>
                <div className="bg-charcoal rounded-lg p-3 border border-warm-sand/10"><p className="text-xl font-bold text-olive-gold">10%</p><p className="text-warm-sand text-xs">Under $20K</p></div>
              </div>
              <p className="text-warm-sand/50 text-xs mt-4">Marketplace fees are estimates and subject to change once marketplace is activated.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story / Testimonial */}
      <section className="py-16 md:py-24 border-t border-warm-sand/10">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <div className="relative inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-olive-gold/20 mb-6">
            <Star className="w-8 md:w-10 h-8 md:h-10 text-olive-gold" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-olive-gold rounded-full flex items-center justify-center">
              <span className="text-charcoal text-[10px] font-bold">1</span>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-warm-white mb-4">
            We&apos;re building this for you
          </h2>
          <p className="text-base md:text-lg text-warm-sand/80 leading-relaxed mb-8">
            OnTap was born from running a mobile bar ourselves. We know what it&apos;s like to 
            juggle booking DMs, chase payments, and email screenshots of quotes at 11pm. 
            This is the tool we wish we had — and now it&apos;s yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-olive-gold text-charcoal px-6 py-3 rounded-lg font-semibold hover:bg-olive-gold/90 transition-colors"
            >
              Join as a Founder <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/sign-in"
              className="inline-flex items-center gap-2 border border-warm-sand/30 text-warm-white px-6 py-3 rounded-lg font-semibold hover:border-olive-gold hover:text-olive-gold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Contact / Waitlist */}
      <section id="waitlist" className="py-16 md:py-24 border-t border-warm-sand/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="bg-warm-sand/5 rounded-2xl p-6 md:p-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl md:text-2xl font-bold text-warm-white mb-2 text-center">Stay in the loop</h3>
              <p className="text-warm-sand/80 text-sm mb-6 text-center">Get updates on launch, pricing, and features.</p>
              
              {submitted ? (
                <div className="bg-olive-gold/20 border border-olive-gold rounded-lg p-4 md:p-6 text-center">
                  <Check className="w-10 md:w-12 h-10 md:h-12 text-olive-gold mx-auto mb-3" />
                  <p className="text-warm-white font-semibold">Thanks for your interest!</p>
                  <p className="text-warm-sand text-sm mt-1">We&apos;ll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-charcoal border border-warm-sand/20 text-warm-white placeholder:text-warm-sand/50 focus:border-olive-gold focus:outline-none text-base"
                  />
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading || spotsLeft === 0}
                    className="w-full flex items-center justify-center gap-2 bg-olive-gold text-charcoal py-3 rounded-lg font-semibold hover:bg-olive-gold/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Sending..." : <><Send className="w-4 h-4" />Join Waitlist</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 border-t border-warm-sand/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative h-8 w-28 sm:h-10 sm:w-40 lg:h-12 lg:w-48">
              <Image 
                src="/images/svg/horizontal_lockup.svg" 
                alt="OnTap" 
                fill
                className="object-contain"
              />
            </div>
            <p className="text-warm-sand/60 text-sm">© 2025 OnTap. All rights reserved.</p>
            <div className="flex gap-4 text-sm">
              <Link href="/terms" className="text-warm-sand/60 hover:text-olive-gold transition-colors">Terms</Link>
              <Link href="/privacy" className="text-warm-sand/60 hover:text-olive-gold transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
