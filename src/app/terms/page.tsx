export const metadata = {
  title: "Terms of Service - OnTap",
  description: "OnTap Terms of Service",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-charcoal py-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-warm-white mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert prose-warm-sand">
          <p className="text-warm-sand mb-6">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-warm-sand mb-4">
            By accessing and using OnTap, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">2. Description of Service</h2>
          <p className="text-warm-sand mb-4">
            OnTap is an all-in-one operating platform for mobile bar operators, providing tools for CRM, scheduling, invoicing, contracts, and client management.
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">3. User Accounts</h2>
          <p className="text-warm-sand mb-4">
            You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">4. Payment Terms</h2>
          <p className="text-warm-sand mb-4">
            Subscription fees are billed monthly. Early access pricing is locked in for the first 500 founding members and remains valid as long as the account remains active.
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">5. Marketplace Fees</h2>
          <p className="text-warm-sand mb-4">
            A marketplace platform fee applies to bookings processed through OnTap. The fee percentage is determined by your annual revenue tier (5%, 7%, or 10%).
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">6. User Content</h2>
          <p className="text-warm-sand mb-4">
            You retain ownership of all content you upload to OnTap. By using our service, you grant us permission to use your content solely for providing the service.
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">7. Limitation of Liability</h2>
          <p className="text-warm-sand mb-4">
            OnTap is provided &quot;as is&quot; without warranties of any kind. We do not guarantee uninterrupted service.
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">8. Termination</h2>
          <p className="text-warm-sand mb-4">
            Either party may terminate this agreement at any time. Upon termination, your access to the service will be immediately revoked.
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">9. Contact Information</h2>
          <p className="text-warm-sand mb-4">
            For questions about these terms, contact us at: <br />
            <span className="text-olive-gold">ontap.inquiries@gmail.com</span>
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">10. Business Information</h2>
          <p className="text-warm-sand mb-4">
            OnTap LLC
          </p>
        </div>
      </div>
    </main>
  );
}