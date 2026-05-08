import { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Kentelle Skincare privacy policy.",
  robots: { index: false, follow: false },
};

const DEFAULT_CONTENT = `1. Information We Collect
We collect information you provide when you create an account, place an order, or contact us. This includes your name, email address, shipping address, and payment details (processed securely via PayPal).

2. How We Use Your Information
We use your information to process orders, send order confirmations, provide customer support, and (with your consent) send marketing communications about new products and offers.

3. Data Sharing
We do not sell your personal information. We share data only with service providers necessary to operate our business (payment processors, shipping carriers, email services) and as required by law.

4. Cookies
We use cookies to maintain your session, remember your cart, and improve our service. You can disable cookies in your browser settings, though some site features may not function correctly.

5. Your Rights
You have the right to access, correct, or delete your personal data. To make a request, contact us at privacy@kentelle.com.au.

6. Contact
For privacy enquiries, email us at privacy@kentelle.com.au.`;

function parseSections(text: string) {
  return text.trim().split(/\n(?=\d+\. )/).map((block) => {
    const nl = block.indexOf("\n");
    if (nl === -1) return { heading: block.trim(), body: "" };
    return { heading: block.slice(0, nl).trim(), body: block.slice(nl + 1).trim() };
  });
}

async function getContent() {
  try {
    const rows = await db.content.findMany({ where: { key: "page_privacy" } });
    if (rows[0]?.value) {
      const parsed = JSON.parse(rows[0].value);
      return { lastUpdated: parsed.lastUpdated ?? "January 2025", content: parsed.content ?? DEFAULT_CONTENT };
    }
  } catch {}
  return { lastUpdated: "January 2025", content: DEFAULT_CONTENT };
}

export default async function PrivacyPage() {
  const { lastUpdated, content } = await getContent();
  const sections = parseSections(content);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading font-bold text-3xl text-brand-navy mb-2">Privacy Policy</h1>
      <p className="text-xs text-brand-contrast font-body mb-10">Last updated: {lastUpdated}</p>

      <div className="prose prose-sm font-body text-brand-navy/80 leading-relaxed space-y-6">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">{s.heading}</h2>
            {s.body && <p>{s.body}</p>}
          </section>
        ))}
      </div>
    </div>
  );
}
