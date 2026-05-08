"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface FooterLink { id: string; label: string; href: string; enabled: boolean; }
interface FooterColumn { id: string; title: string; links: FooterLink[]; }
interface SocialLink { id: string; label: string; href: string; }
interface FooterData {
  columns: FooterColumn[];
  brandDescription: string;
  socialLinks: SocialLink[];
  copyright: string;
}

const DEFAULT: FooterData = {
  brandDescription: "Science-backed skincare crafted for Australian skin. Clean ingredients, real results.",
  socialLinks: [
    { id: "s1", label: "Instagram", href: "https://instagram.com/kentelle" },
    { id: "s2", label: "Facebook", href: "https://facebook.com/kentelle" },
  ],
  copyright: `© ${new Date().getFullYear()} Kentelle Skincare. All rights reserved.`,
  columns: [
    {
      id: "col1", title: "Shop", links: [
        { id: "l1", label: "All Products", href: "/shop", enabled: true },
        { id: "l2", label: "Collections", href: "/collections", enabled: true },
        { id: "l3", label: "Face Wash", href: "/shop", enabled: true },
        { id: "l4", label: "Moisturisers", href: "/shop", enabled: true },
        { id: "l5", label: "Serums", href: "/shop", enabled: true },
        { id: "l6", label: "Eye Care", href: "/shop", enabled: true },
      ],
    },
    {
      id: "col2", title: "Help", links: [
        { id: "l7", label: "Find Your Routine", href: "/find-your-routine", enabled: true },
        { id: "l8", label: "Skin Regimen", href: "/skin-regimen", enabled: true },
        { id: "l9", label: "FAQ", href: "/faq", enabled: true },
        { id: "l10", label: "Contact Us", href: "/contact", enabled: true },
        { id: "l11", label: "About Kentelle", href: "/about", enabled: true },
        { id: "l12", label: "Blog", href: "/blog", enabled: true },
        { id: "l13", label: "Reviews", href: "/reviews", enabled: true },
      ],
    },
    {
      id: "col3", title: "Account", links: [
        { id: "l14", label: "My Account", href: "/account", enabled: true },
        { id: "l15", label: "Track Order", href: "/account/orders", enabled: true },
        { id: "l16", label: "Gift Cards", href: "/gift-cards", enabled: true },
        { id: "l17", label: "Returns & Refunds", href: "/faq#returns", enabled: true },
      ],
    },
  ],
};

function PaymentIcons() {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <svg viewBox="0 0 50 32" className="h-7 w-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="50" height="32" rx="4" fill="white" />
        <rect width="50" height="32" rx="4" fill="none" stroke="#e0e0e0" strokeWidth="1" />
        <text x="25" y="22" textAnchor="middle" fill="#1A1F71" fontWeight="900" fontSize="13" fontFamily="Arial, sans-serif" letterSpacing="0.5">VISA</text>
      </svg>
      <svg viewBox="0 0 50 32" className="h-7 w-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="50" height="32" rx="4" fill="white" />
        <rect width="50" height="32" rx="4" fill="none" stroke="#e0e0e0" strokeWidth="1" />
        <circle cx="19" cy="16" r="8" fill="#EB001B" />
        <circle cx="31" cy="16" r="8" fill="#F79E1B" />
        <path d="M25 9.54a8 8 0 0 1 0 12.92A8 8 0 0 1 25 9.54z" fill="#FF5F00" />
      </svg>
      <svg viewBox="0 0 54 32" className="h-7 w-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="54" height="32" rx="4" fill="#2557D6" />
        <text x="27" y="21" textAnchor="middle" fill="white" fontWeight="800" fontSize="11" fontFamily="Arial, sans-serif" letterSpacing="1.5">AMEX</text>
      </svg>
      <svg viewBox="0 0 58 32" className="h-7 w-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="58" height="32" rx="4" fill="white" />
        <rect width="58" height="32" rx="4" fill="none" stroke="#e0e0e0" strokeWidth="1" />
        <text x="29" y="22" textAnchor="middle" fill="#253B80" fontWeight="bold" fontSize="12" fontFamily="Arial, sans-serif">
          <tspan fill="#009CDE">Pay</tspan><tspan fill="#253B80">Pal</tspan>
        </text>
      </svg>
      <svg viewBox="0 0 58 32" className="h-7 w-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="58" height="32" rx="4" fill="black" />
        <text x="29" y="22" textAnchor="middle" fill="white" fontWeight="500" fontSize="11" fontFamily="-apple-system, Arial, sans-serif" letterSpacing="0.2"> Pay</text>
      </svg>
      <svg viewBox="0 0 64 32" className="h-7 w-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="32" rx="4" fill="white" />
        <rect width="64" height="32" rx="4" fill="none" stroke="#e0e0e0" strokeWidth="1" />
        <text x="32" y="22" textAnchor="middle" fontSize="12" fontFamily="Arial, sans-serif" fontWeight="500">
          <tspan fill="#4285F4">G</tspan><tspan fill="#555"> Pay</tspan>
        </text>
      </svg>
      <svg viewBox="0 0 58 32" className="h-7 w-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="58" height="32" rx="4" fill="#5A31F4" />
        <text x="29" y="22" textAnchor="middle" fill="white" fontWeight="700" fontSize="11" fontFamily="Arial, sans-serif" letterSpacing="0.5">shop</text>
      </svg>
    </div>
  );
}

export default function Footer() {
  const [data, setData] = useState<FooterData>(DEFAULT);

  useEffect(() => {
    fetch("/api/admin/pages/content?key=nav_footer")
      .then((r) => r.json())
      .then((d) => {
        if (d.value) {
          const parsed = JSON.parse(d.value);
          // Handle legacy format (plain columns array)
          if (Array.isArray(parsed)) {
            setData({ ...DEFAULT, columns: parsed });
          } else {
            setData({ ...DEFAULT, ...parsed });
          }
        }
      })
      .catch(() => {});
  }, []);

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
            {data.brandDescription}
          </p>
          {data.socialLinks.length > 0 && (
            <div className="flex gap-3">
              {data.socialLinks.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-contrast hover:text-brand-white transition-colors"
                  aria-label={s.label}
                >
                  <ExternalLink size={20} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic columns */}
        {data.columns.map((col) => (
          <div key={col.id}>
            <h4 className="font-heading font-bold text-xs tracking-widest uppercase mb-4 text-brand-contrast">
              {col.title}
            </h4>
            <ul className="space-y-2">
              {col.links.filter((l) => l.enabled).map((l) => (
                <li key={l.id}>
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
        ))}
      </div>

      {/* Newsletter */}
      <div className="border-t border-brand-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-heading font-bold text-xs tracking-widest uppercase">
            Get skincare tips &amp; exclusive offers
          </p>
          <form action="/api/subscribe" method="POST" className="flex w-full max-w-sm">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="flex-1 bg-transparent border border-brand-white/20 px-4 py-2.5 text-sm text-brand-white placeholder:text-brand-contrast/60 outline-none focus:border-brand-white/60 transition-colors"
            />
            <button
              type="submit"
              className="bg-brand-accent text-brand-navy rounded px-5 py-2.5 text-xs font-heading font-bold tracking-widest uppercase hover:bg-brand-accent/80 transition-colors"
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
          <PaymentIcons />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-brand-contrast font-body">
          <p>{data.copyright}</p>
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
