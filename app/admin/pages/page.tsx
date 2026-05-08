import { Metadata } from "next";
import Link from "next/link";
import { Images, Star, HelpCircle, User, Phone, Shield, FileText, Sparkles, MessageSquare } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Pages" };

const sections = [
  {
    icon: Images,
    label: "Home Carousel",
    description: "Add, remove or enable/disable hero banner slides. Edit title, subtext, button and image per slide.",
    href: "/admin/pages/carousel",
    badge: "Homepage",
  },
  {
    icon: Star,
    label: "Trust Strip",
    description: "Edit the vegan / cruelty-free / dermatologist badges shown below the hero.",
    href: "/admin/pages/trust-strip",
    badge: "Homepage",
  },
  {
    icon: Sparkles,
    label: "Routines Section",
    description: "Edit the section header and both category card titles, descriptions and link labels.",
    href: "/admin/pages/routines-section",
    badge: "Homepage",
  },
  {
    icon: MessageSquare,
    label: "Reviews Banner",
    description: "Edit the section header, rating text and all customer review quotes shown on the homepage.",
    href: "/admin/pages/reviews",
    badge: "Homepage",
  },
  {
    icon: User,
    label: "About Us",
    description: "Edit the About Us page — hero text, founder bio and story sections.",
    href: "/admin/pages/about",
    badge: "Page",
  },
  {
    icon: Phone,
    label: "Contact Us",
    description: "Edit contact details: email, phone, address and opening hours.",
    href: "/admin/pages/contact",
    badge: "Page",
  },
  {
    icon: HelpCircle,
    label: "FAQ",
    description: "Add, edit or remove frequently asked questions. Enable or disable individual items.",
    href: "/admin/pages/faq",
    badge: "Page",
  },
  {
    icon: Shield,
    label: "Privacy Policy",
    description: "Edit the full Privacy Policy page content.",
    href: "/admin/pages/privacy",
    badge: "Page",
  },
  {
    icon: FileText,
    label: "Terms & Conditions",
    description: "Edit the full Terms & Conditions page content.",
    href: "/admin/pages/terms",
    badge: "Page",
  },
];

export default function AdminPagesIndex() {
  return (
    <AdminShell>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-2xl text-brand-navy">Pages</h1>
          <p className="text-sm font-body text-brand-contrast mt-1">Manage content across the website.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map(({ icon: Icon, label, description, href, badge }) => (
            <Link
              key={href}
              href={href}
              className="group bg-white border border-brand-contrast/10 hover:border-brand-blue/30 hover:shadow-md transition-all duration-200 p-6 block"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-brand-navy/5 flex items-center justify-center group-hover:bg-brand-blue/10 transition-colors">
                  <Icon size={18} className="text-brand-navy group-hover:text-brand-blue transition-colors" />
                </div>
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast/60 bg-[#F8F9FC] px-2 py-0.5">
                  {badge}
                </span>
              </div>
              <h2 className="font-heading font-bold text-base text-brand-navy mb-1.5 group-hover:text-brand-blue transition-colors">
                {label}
              </h2>
              <p className="text-xs font-body text-brand-contrast leading-relaxed">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
