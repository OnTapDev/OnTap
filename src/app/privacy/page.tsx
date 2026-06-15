export const metadata = {
  title: "Privacy Policy - OnTap",
  description: "OnTap Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-charcoal py-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-warm-white mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-warm-sand">
          <p className="text-warm-sand mb-6">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-warm-sand mb-4">
            We collect information you provide directly to us, including:
          </p>
          <ul className="text-warm-sand list-disc pl-6 mb-4 space-y-2">
            <li>Account information (name, email, phone)</li>
            <li>Business information (company name, address)</li>
            <li>Customer/contact data you manage on our platform</li>
            <li>Payment information (processed through third-party providers)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-warm-sand mb-4">We use the information we collect to:</p>
          <ul className="text-warm-sand list-disc pl-6 mb-4 space-y-2">
            <li>Provide and maintain our services</li>
            <li>Process your transactions</li>
            <li>Send you technical notices and support messages</li>
            <li>Communicate with you about products, services, and events</li>
            <li>Improve and develop new features</li>
          </ul>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">3. Data Storage & Security</h2>
          <p className="text-warm-sand mb-4">
            Your data is stored on secure servers. We implement appropriate technical and organizational measures to protect your personal information.
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">4. Third-Party Services</h2>
          <p className="text-warm-sand mb-4">
            We use third-party services for payment processing, email delivery, and authentication. These parties have their own privacy policies governing their use of your information.
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">5. Data Sharing</h2>
          <p className="text-warm-sand mb-4">
            We do not sell your personal information. We may share information with service providers who assist in operating our platform.
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">6. Your Rights</h2>
          <p className="text-warm-sand mb-4">You have the right to:</p>
          <ul className="text-warm-sand list-disc pl-6 mb-4 space-y-2">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
          </ul>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">7. Children&apos;s Privacy</h2>
          <p className="text-warm-sand mb-4">
            Our service is not intended for individuals under the age of 18.
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">8. Changes to This Policy</h2>
          <p className="text-warm-sand mb-4">
            We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page.
          </p>

          <h2 className="text-2xl font-semibold text-warm-white mt-8 mb-4">9. Contact Us</h2>
          <p className="text-warm-sand mb-4">
            For questions about this privacy policy, contact us at: <br />
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