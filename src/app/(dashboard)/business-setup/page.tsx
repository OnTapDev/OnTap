import Link from "next/link";
import { ArrowLeft, Shield, FileCheck, CheckCircle2, ExternalLink } from "lucide-react";
import { getUserOrgId } from "@/lib/auth";
import { getSetupProgress } from "./actions";
import { SetupProgress } from "./SetupProgress";

export default async function BusinessSetupPage() {
  const orgId = await getUserOrgId();
  const progress = await getSetupProgress(orgId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-olive-gold hover:text-warm-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-screen-title text-warm-white">Business Setup</h1>
          <p className="text-warm-sand mt-1">Everything you need to launch your mobile bar business</p>
        </div>
      </div>

      <SetupProgress progress={progress} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Insurance Section */}
        <div className="bg-charcoal border border-warm-sand/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-olive-gold/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-olive-gold" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-warm-white">Insurance</h2>
              <p className="text-warm-sand text-sm">Protect your business</p>
            </div>
          </div>

          <div className="space-y-4">
            <InsuranceItem
              title="Liquor Liability Insurance"
              description="Essential coverage for mobile bartending operations. Protects against claims from overserving."
              providers={[
                { name: "CoverWallet", url: "https://www.coverwallet.com" },
                { name: "Thimble", url: "https://www.thimble.com" },
                { name: "Hiscox", url: "https://www.hiscox.com" },
              ]}
            />

            <InsuranceItem
              title="General Liability Insurance"
              description="Covers property damage, bodily injury, and accidents at events."
              providers={[
                { name: "NEXT Insurance", url: "https://www.nextinsurance.com" },
                { name: "The Hartford", url: "https://www.thehartford.com" },
              ]}
            />

            <InsuranceItem
              title="Commercial Auto Insurance"
              description="If you use a vehicle for your business, this covers accidents and damages."
              providers={[
                { name: "Progressive Commercial", url: "https://www.progressivecommercial.com" },
                { name: "State Farm", url: "https://www.statefarm.com" },
              ]}
            />
          </div>
        </div>

        {/* Company Formation Section */}
        <div className="bg-charcoal border border-warm-sand/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-olive-gold/20 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-olive-gold" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-warm-white">Company Formation</h2>
              <p className="text-warm-sand text-sm">Set up your business legally</p>
            </div>
          </div>

          <div className="space-y-4">
            <FormationItem
              title="LLC (Limited Liability Company)"
              description="Most popular for small businesses. Protects personal assets and has flexible tax options."
              providers={[
                { name: "LegalZoom", url: "https://www.legalzoom.com" },
                { name: "Incfile", url: "https://www.incfile.com" },
                { name: "Stripe Atlas", url: "https://stripe.com/atlas" },
              ]}
            />

            <FormationItem
              title="C-Corp or S-Corp"
              description="Better for those planning to raise investment or have multiple shareholders."
              providers={[
                { name: "LegalZoom", url: "https://www.legalzoom.com" },
                { name: "CorpNet", url: "https://www.corpnet.com" },
              ]}
            />

            <FormationItem
              title="Registered Agent"
              description="Required to receive legal documents. Many formation services include this."
              providers={[
                { name: "Inc Authority", url: "https://www.incauthority.com" },
                { name: "National Registered Agents", url: "https://www.nrai.com" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Permits & Licenses */}
      <div className="bg-charcoal border border-warm-sand/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-olive-gold/20 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-olive-gold" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-warm-white">Permits & Licenses</h2>
            <p className="text-warm-sand text-sm">What&apos;s required in your area</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
            <h3 className="text-warm-white font-medium mb-2">Liquor License</h3>
            <p className="text-warm-sand text-sm mb-3">Requirements vary by state. Check with your local alcohol beverage control board.</p>
            <a 
              href="https://www.ttb.gov/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-olive-gold text-sm flex items-center gap-1 hover:underline"
            >
              TTB.gov <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
            <h3 className="text-warm-white font-medium mb-2">Catering Permit</h3>
            <p className="text-warm-sand text-sm mb-3">Often required to serve at events not held at your licensed premises.</p>
            <p className="text-warm-sand/60 text-xs">Check your state requirements</p>
          </div>

          <div className="p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
            <h3 className="text-warm-white font-medium mb-2">Business License</h3>
            <p className="text-warm-sand text-sm mb-3">General business license from your city or county.</p>
            <p className="text-warm-sand/60 text-xs">Contact local government</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-olive-gold/10 border border-olive-gold/20 rounded-xl p-6">
        <h3 className="text-warm-white font-semibold mb-3">Pro Tips</h3>
        <ul className="space-y-2 text-warm-sand text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-olive-gold mt-0.5 flex-shrink-0" />
            Start with LLC + general liability insurance and liquor liability insurance before taking any paid events
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-olive-gold mt-0.5 flex-shrink-0" />
            Keep business and personal finances separate — open a business bank account
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-olive-gold mt-0.5 flex-shrink-0" />
            Consider hiring an accountant familiar with service businesses for tax planning
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-olive-gold mt-0.5 flex-shrink-0" />
            Document everything — contracts, receipts, communications
          </li>
        </ul>
      </div>
    </div>
  );
}

function InsuranceItem({ 
  title, 
  description, 
  providers 
}: { 
  title: string; 
  description: string; 
  providers: { name: string; url: string }[] 
}) {
  return (
    <div className="p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
      <h3 className="text-warm-white font-medium mb-1">{title}</h3>
      <p className="text-warm-sand text-sm mb-3">{description}</p>
      <div className="flex flex-wrap gap-2">
        {providers.map((provider) => (
          <a
            key={provider.name}
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 bg-olive-gold/20 text-olive-gold rounded-full hover:bg-olive-gold/30 transition-colors flex items-center gap-1"
          >
            {provider.name} <ExternalLink className="w-3 h-3" />
          </a>
        ))}
      </div>
    </div>
  );
}

function FormationItem({ 
  title, 
  description, 
  providers 
}: { 
  title: string; 
  description: string; 
  providers: { name: string; url: string }[] 
}) {
  return (
    <div className="p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
      <h3 className="text-warm-white font-medium mb-1">{title}</h3>
      <p className="text-warm-sand text-sm mb-3">{description}</p>
      <div className="flex flex-wrap gap-2">
        {providers.map((provider) => (
          <a
            key={provider.name}
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 bg-olive-gold/20 text-olive-gold rounded-full hover:bg-olive-gold/30 transition-colors flex items-center gap-1"
          >
            {provider.name} <ExternalLink className="w-3 h-3" />
          </a>
        ))}
      </div>
    </div>
  );
}