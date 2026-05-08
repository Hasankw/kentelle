import { Metadata } from "next";
import Link from "next/link";
import { Navigation, PanelBottom } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Appearance" };

const sections = [
  {
    icon: Navigation,
    label: "Header Navigation",
    description: "Add, edit, remove or reorder nav links. Add sub-menu items under any link. Enable or disable individual items.",
    href: "/admin/appearance/header",
  },
  {
    icon: PanelBottom,
    label: "Footer",
    description: "Manage footer columns — rename columns, add/edit/remove/reorder links within each column. Enable or disable per link.",
    href: "/admin/appearance/footer",
  },
];

export default function AppearancePage() {
  return (
    <AdminShell>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-2xl text-brand-navy">Appearance</h1>
          <p className="text-sm font-body text-brand-contrast mt-1">Customise header navigation and footer links.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-2xl">
          {sections.map(({ icon: Icon, label, description, href }) => (
            <Link
              key={href}
              href={href}
              className="group bg-white border border-brand-contrast/10 hover:border-brand-blue/30 hover:shadow-md transition-all duration-200 p-6 block"
            >
              <div className="w-10 h-10 bg-brand-navy/5 flex items-center justify-center group-hover:bg-brand-blue/10 transition-colors mb-4">
                <Icon size={18} className="text-brand-navy group-hover:text-brand-blue transition-colors" />
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
