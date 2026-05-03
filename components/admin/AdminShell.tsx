"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FileText,
  Star,
  Mail,
  LogOut,
  Settings,
  Tag,
  Warehouse,
  Gift,
  Ticket,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: Warehouse, label: "Inventory", href: "/admin/inventory" },
  { icon: Tag, label: "Categories", href: "/admin/categories" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: Gift, label: "Gift Cards", href: "/admin/gift-cards" },
  { icon: Ticket, label: "Coupons", href: "/admin/coupons" },
  { icon: Star, label: "Reviews", href: "/admin/reviews" },
  { icon: FileText, label: "Blog", href: "/admin/blog" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: Mail, label: "Leads", href: "/admin/leads" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FC]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-brand-navy flex flex-col min-h-screen">
        <div className="px-6 py-5 border-b border-brand-white/10">
          <p className="font-heading font-bold text-sm uppercase tracking-widest text-brand-white">
            Kentelle
          </p>
          <p className="text-[10px] text-brand-contrast font-body mt-0.5">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-0.5">
            {navItems.map(({ icon: Icon, label, href }) => {
              const active =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-5 py-2.5 text-xs font-heading font-bold uppercase tracking-wider transition-colors",
                      active
                        ? "bg-brand-blue text-brand-white rounded"
                        : "text-brand-white/60 hover:text-brand-white hover:bg-brand-white/5"
                    )}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-brand-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-heading font-bold uppercase tracking-wider text-brand-white/60 hover:text-brand-white hover:bg-brand-white/5 transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
