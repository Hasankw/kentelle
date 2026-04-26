import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Kentelle Skincare privacy policy.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading font-bold text-3xl text-brand-navy mb-2">Privacy Policy</h1>
      <p className="text-xs text-brand-contrast font-body mb-10">Last updated: January 2025</p>

      <div className="prose prose-sm font-body text-brand-navy/80 leading-relaxed space-y-6">
        <section>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">1. Information We Collect</h2>
          <p>We collect information you provide when you create an account, place an order, or contact us. This includes your name, email address, shipping address, and payment details (processed securely via PayPal).</p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">2. How We Use Your Information</h2>
          <p>We use your information to process orders, send order confirmations, provide customer support, and (with your consent) send marketing communications about new products and offers.</p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">3. Data Sharing</h2>
          <p>We do not sell your personal information. We share data only with service providers necessary to operate our business (payment processors, shipping carriers, email services) and as required by law.</p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">4. Cookies</h2>
          <p>We use cookies to maintain your session, remember your cart, and improve our service. You can disable cookies in your browser settings, though some site features may not function correctly.</p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. To make a request, contact us at privacy@kentelle.com.au.</p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">6. Contact</h2>
          <p>For privacy enquiries, email us at <a href="mailto:privacy@kentelle.com.au" className="text-brand-blue hover:underline">privacy@kentelle.com.au</a>.</p>
        </section>
      </div>
    </div>
  );
}
