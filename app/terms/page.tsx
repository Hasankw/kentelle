import { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Kentelle Skincare terms of service.",
  robots: { index: false, follow: false },
};

const DEFAULT_CONTENT = `1. Acceptance
By accessing or purchasing from Kentelle Skincare, you agree to these terms. If you do not agree, please do not use our site.

2. Products
All products are subject to availability. We reserve the right to limit quantities and discontinue products at any time. Product images are for illustrative purposes and may vary slightly from the actual product.

3. Pricing
All prices are in Australian Dollars (AUD) and include GST. We reserve the right to change prices without notice. Your order total is confirmed at the time of purchase.

4. Shipping
Orders are dispatched within 2–3 business days. Delivery times vary by location. We are not responsible for delays caused by carriers or customs.

5. Returns
We accept returns within 30 days of delivery for unused, unopened items in original packaging. Contact us at hello@kentelle.com.au to initiate a return. Sale items are final sale.

6. Limitation of Liability
To the maximum extent permitted by Australian law, Kentelle Skincare is not liable for any indirect, incidental, or consequential damages arising from the use of our products or website.

7. Contact
Questions? Email us at hello@kentelle.com.au.`;

function parseSections(text: string) {
  return text.trim().split(/\n(?=\d+\. )/).map((block) => {
    const nl = block.indexOf("\n");
    if (nl === -1) return { heading: block.trim(), body: "" };
    return { heading: block.slice(0, nl).trim(), body: block.slice(nl + 1).trim() };
  });
}

async function getContent() {
  try {
    const rows = await db.content.findMany({ where: { key: "page_terms" } });
    if (rows[0]?.value) {
      const parsed = JSON.parse(rows[0].value);
      return { lastUpdated: parsed.lastUpdated ?? "January 2025", content: parsed.content ?? DEFAULT_CONTENT };
    }
  } catch {}
  return { lastUpdated: "January 2025", content: DEFAULT_CONTENT };
}

export default async function TermsPage() {
  const { lastUpdated, content } = await getContent();
  const sections = parseSections(content);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading font-bold text-3xl text-brand-navy mb-2">Terms of Service</h1>
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
