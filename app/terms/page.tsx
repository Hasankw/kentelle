import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Kentelle Skincare terms of service.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading font-bold text-3xl text-brand-navy mb-2">Terms of Service</h1>
      <p className="text-xs text-brand-contrast font-body mb-10">Last updated: January 2025</p>

      <div className="prose prose-sm font-body text-brand-navy/80 leading-relaxed space-y-6">
        <section>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">1. Acceptance</h2>
          <p>By accessing or purchasing from Kentelle Skincare, you agree to these terms. If you do not agree, please do not use our site.</p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">2. Products</h2>
          <p>All products are subject to availability. We reserve the right to limit quantities and discontinue products at any time. Product images are for illustrative purposes and may vary slightly from the actual product.</p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">3. Pricing</h2>
          <p>All prices are in Australian Dollars (AUD) and include GST. We reserve the right to change prices without notice. Your order total is confirmed at the time of purchase.</p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">4. Shipping</h2>
          <p>Orders are dispatched within 2–3 business days. Delivery times vary by location. We are not responsible for delays caused by carriers or customs.</p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">5. Returns</h2>
          <p>We accept returns within 30 days of delivery for unused, unopened items in original packaging. Contact us at hello@kentelle.com.au to initiate a return. Sale items are final sale.</p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">6. Limitation of Liability</h2>
          <p>To the maximum extent permitted by Australian law, Kentelle Skincare is not liable for any indirect, incidental, or consequential damages arising from the use of our products or website.</p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">7. Contact</h2>
          <p>Questions? Email us at <a href="mailto:hello@kentelle.com.au" className="text-brand-blue hover:underline">hello@kentelle.com.au</a>.</p>
        </section>
      </div>
    </div>
  );
}
