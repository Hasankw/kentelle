import Link from "next/link";
import { ExternalLink, Globe } from "lucide-react";

const shopLinks = [
  { label: "All Products", href: "/shop" },
  { label: "Skincare", href: "/shop" },
  { label: "Face Wash", href: "/shop" },
  { label: "Moisturisers", href: "/shop" },
  { label: "Serums", href: "/shop" },
  { label: "Eye Care", href: "/shop" },
];

const helpLinks = [
  { label: "Find Your Routine", href: "/find-your-routine" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
  { label: "About Kentelle", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Reviews", href: "/reviews" },
];

const accountLinks = [
  { label: "My Account", href: "/account" },
  { label: "Track Order", href: "/account/orders" },
  { label: "Gift Cards", href: "/gift-cards" },
  { label: "Returns & Refunds", href: "/faq#returns" },
];

const paymentMethods = [
  "Visa", "Mastercard", "PayPal", "Amex", "Apple Pay", "Google Pay",
];

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-brand-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-heading font-bold text-xl tracking-widest uppercase mb-4">
            Kentelle
          </h3>
          <p className="font-body text-sm text-brand-contrast leading-relaxed mb-6">
            Science-backed skincare crafted for Australian skin. Clean ingredients,
            real results.
          </p>
          <div className="flex gap-3">
            <a
              href="https://instagram.com/kentelle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-contrast hover:text-brand-white transition-colors"
              aria-label="Instagram"
            >
              <ExternalLink size={20} />
            </a>
            <a
              href="https://facebook.com/kentelle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-contrast hover:text-brand-white transition-colors"
              aria-label="Facebook"
            >
              <Globe size={20} />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-heading font-bold text-xs tracking-widest uppercase mb-4 text-brand-contrast">
            Shop
          </h4>
          <ul className="space-y-2">
            {shopLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="font-body text-sm text-brand-contrast hover:text-brand-white transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="font-heading font-bold text-xs tracking-widest uppercase mb-4 text-brand-contrast">
            Help
          </h4>
          <ul className="space-y-2">
            {helpLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-body text-sm text-brand-contrast hover:text-brand-white transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="font-heading font-bold text-xs tracking-widest uppercase mb-4 text-brand-contrast">
            Account
          </h4>
          <ul className="space-y-2">
            {accountLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-body text-sm text-brand-contrast hover:text-brand-white transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-brand-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-heading font-bold text-xs tracking-widest uppercase">
            Get skincare tips &amp; exclusive offers
          </p>
          <form
            action="/api/subscribe"
            method="POST"
            className="flex w-full max-w-sm"
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="flex-1 bg-transparent border border-brand-white/20 px-4 py-2.5 text-sm text-brand-white placeholder:text-brand-contrast/60 outline-none focus:border-brand-white/60 transition-colors"
            />
            <button
              type="submit"
              className="bg-brand-accent text-brand-navy px-5 py-2.5 text-xs font-heading font-bold tracking-widest uppercase hover:bg-brand-accent/80 transition-colors"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Currency + Payment icons */}
      <div className="border-t border-brand-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-brand-contrast font-body flex items-center gap-1.5">
            🇦🇺 Australia (AUD $)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {paymentMethods.map((m) => (
              <span
                key={m}
                className="border border-brand-white/20 rounded px-2 py-0.5 text-[10px] font-heading font-bold text-brand-contrast/70 tracking-wide"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-brand-contrast font-body">
          <p>© {new Date().getFullYear()} Kentelle Skincare. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-brand-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Legal disclaimer */}
      <div className="border-t border-brand-white/10 bg-brand-navy/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="text-[11px] text-brand-contrast/60 font-body leading-relaxed">
            All Kentelle Skincare products are intended for cosmetic use only and are not registered as therapeutic goods with the TGA.
            Product information is provided for general educational purposes and does not constitute medical advice.
            Consult your dermatologist, general practitioner, or qualified healthcare professional before purchasing or using any skincare product.
            Carefully read and follow all instructions and warnings provided on product packaging.
            If adverse reactions occur, discontinue use immediately and seek medical attention promptly.
            These products are not intended to diagnose, treat, cure or prevent any disease or health condition.
            Kentelle Skincare disclaims liability for any injury, adverse effect, or outcome resulting from product use.
          </p>
        </div>
      </div>
    </footer>
  );
}
