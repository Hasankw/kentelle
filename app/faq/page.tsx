import { Metadata } from "next";
import Accordion from "@/components/ui/Accordion";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Kentelle Skincare.",
  robots: { index: true, follow: true },
};

const DEFAULTS = [
  { id: "1", title: "How do I know which products are right for my skin?", content: "We recommend taking our Skin Quiz for personalised recommendations based on your skin type, concerns, and goals. You can also contact our skincare experts via the Contact page for personalised advice.", enabled: true },
  { id: "2", title: "Are your products suitable for sensitive skin?", content: "Many of our products are formulated specifically for sensitive skin, including our Gentle Foam Cleanser, Sensitive Skin Calming Serum, and Soothing Centella Toner. All products are fragrance-free and dermatologist-tested. Always patch-test before full application.", enabled: true },
  { id: "3", title: "Are Kentelle products vegan and cruelty-free?", content: "Yes! All Kentelle products are 100% vegan and cruelty-free. We never use animal-derived ingredients and never test on animals. We are certified by PETA.", enabled: true },
  { id: "4", title: "What is your shipping policy?", content: "We offer free shipping on all orders over $80 AUD. Standard shipping (3–7 business days) is $9.95 for orders under $80. Express shipping is available at checkout. We ship Australia-wide.", enabled: true },
  { id: "5", title: "Can I return or exchange a product?", content: "We offer a 30-day satisfaction guarantee. If you're not completely happy with your purchase, contact us within 30 days of receiving your order for a full refund or exchange. Products must be at least 50% full to be eligible.", enabled: true },
  { id: "6", title: "How long does shipping take?", content: "Standard shipping takes 3–7 business days within Australia. Express shipping takes 1–2 business days. Orders are processed within 1 business day of being placed.", enabled: true },
  { id: "7", title: "Can I use multiple Kentelle products together?", content: "Yes! Our products are designed to work together. However, some active ingredients like retinol and AHAs should not be used on the same evening. Check each product's How to Use section for guidance, or contact us for a personalised routine.", enabled: true },
  { id: "8", title: "Are your products safe during pregnancy?", content: "We recommend consulting with your healthcare provider during pregnancy. As a general guideline, avoid retinol and high-concentration AHA/BHA products. Our Bakuchiol Firming Serum is a pregnancy-safe alternative to retinol.", enabled: true },
  { id: "9", title: "How do I track my order?", content: "Once your order ships, you'll receive a tracking email with your tracking number. You can also track your order from your account page.", enabled: true },
  { id: "10", title: "Do you offer a rewards program?", content: "We're working on a loyalty rewards program — coming soon! Subscribe to our newsletter to be the first to know.", enabled: true },
];

async function getFaqs() {
  try {
    const rows = await db.content.findMany({ where: { key: "page_faq" } });
    if (rows[0]?.value) {
      const all = JSON.parse(rows[0].value);
      return all.filter((f: any) => f.enabled);
    }
  } catch {}
  return DEFAULTS.filter((f) => f.enabled);
}

export default async function FAQPage() {
  const faqs = await getFaqs();
  const items = faqs.map((f: any) => ({ title: f.title, content: f.content }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-3">
          Help Centre
        </p>
        <h1 className="font-heading font-bold text-4xl text-brand-navy">
          Frequently Asked Questions
        </h1>
      </div>

      <Accordion items={items} />

      <div className="mt-12 text-center border-t border-brand-contrast/20 pt-12">
        <p className="font-body text-sm text-brand-contrast mb-4">
          Still have questions? We&apos;d love to help.
        </p>
        <a
          href="/contact"
          className="inline-block bg-brand-accent text-brand-navy rounded px-6 py-3 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
