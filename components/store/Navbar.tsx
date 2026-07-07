"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

interface NavChild { id: string; label: string; href: string; enabled: boolean; }
interface NavLink { id: string; label: string; href: string; enabled: boolean; children: NavChild[]; }

const PRODUCT_LAYERING_NAV: NavLink = {
  id: "product-layering",
  label: "Layering",
  href: "/product-layering",
  enabled: true,
  children: [],
};

const BLOG_NAV: NavLink = {
  id: "blog",
  label: "Blog",
  href: "/blog",
  enabled: true,
  children: [],
};

const DEFAULT_NAV: NavLink[] = [
  { id: "1", label: "Shop", href: "/shop", enabled: true, children: [] },
  { id: "2", label: "Collections", href: "/collections", enabled: true, children: [] },
  PRODUCT_LAYERING_NAV,
  BLOG_NAV,
  { id: "3", label: "About", href: "/about", enabled: true, children: [] },
  { id: "4", label: "Contact", href: "/contact", enabled: true, children: [] },
];

function injectNavItem(links: NavLink[], item: NavLink, afterHref: string, fallbackIndex: number) {
  if (links.some((link) => link.id === item.id || link.href === item.href)) {
    return links;
  }

  const anchorIndex = links.findIndex((link) => link.href === afterHref);
  const insertAt = anchorIndex >= 0 ? anchorIndex + 1 : Math.min(fallbackIndex, links.length);
  return [
    ...links.slice(0, insertAt),
    item,
    ...links.slice(insertAt),
  ];
}

function withInjectedNav(links: NavLink[]) {
  const withLayering = injectNavItem(links, PRODUCT_LAYERING_NAV, "/collections", 2);
  return injectNavItem(withLayering, BLOG_NAV, PRODUCT_LAYERING_NAV.href, 3);
}

interface NavbarProps {
  onSearchOpen: () => void;
  onCartOpen: () => void;
}

export default function Navbar({ onSearchOpen, onCartOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [navLinks, setNavLinks] = useState<NavLink[]>(withInjectedNav(DEFAULT_NAV));
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/admin/pages/content?key=nav_header")
      .then((r) => r.json())
      .then((d) => { if (d.value) setNavLinks(withInjectedNav(JSON.parse(d.value))); })
      .catch(() => {});
  }, []);
  const itemCount = useCartStore((s) => s.itemCount());

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    function applyUser(user: any) {
      if (!user) { setGreeting(""); return; }
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "";
      setGreeting(name);
    }

    supabase.auth.getUser().then(({ data }) => applyUser(data?.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-40 bg-white transition-shadow duration-200",
        scrolled ? "shadow-md" : "border-b border-brand-contrast/10"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden text-brand-navy"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 font-heading font-bold text-xl md:text-2xl tracking-[0.2em] uppercase text-brand-navy"
          >
            Kentelle
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-7 md:absolute md:left-1/2 md:-translate-x-1/2">
            {navLinks.filter((l) => l.enabled).map((link) => {
              const activeChildren = link.children?.filter((c) => c.enabled) ?? [];
              return (
                <li key={link.id} className="relative group">
                  <Link
                    href={link.href}
                    className="text-[11px] font-heading font-bold uppercase tracking-widest text-brand-navy hover:text-brand-blue transition-colors"
                  >
                    {link.label}
                  </Link>
                  {activeChildren.length > 0 && (
                    <ul className="absolute top-full left-0 mt-2 bg-white border border-brand-contrast/10 shadow-lg min-w-[160px] hidden group-hover:block z-50">
                      {activeChildren.map((child) => (
                        <li key={child.id}>
                          <Link href={child.href} className="block px-4 py-2.5 text-[11px] font-heading font-bold uppercase tracking-widest text-brand-navy hover:bg-brand-bg hover:text-brand-blue transition-colors">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={onSearchOpen}
              aria-label="Search"
              className="text-brand-navy hover:text-brand-blue transition-colors"
            >
              <Search size={20} />
            </button>
            <Link
              href={greeting ? "/account" : `/login?redirect=${encodeURIComponent(pathname)}`}
              aria-label="Account"
              className="flex items-center gap-1.5 text-brand-navy hover:text-brand-blue transition-colors"
            >
              <User size={20} />
              {greeting && (
                <span className="hidden sm:block text-[11px] font-heading font-bold uppercase tracking-wider">
                  Hello, {greeting}
                </span>
              )}
            </Link>
            <button
              onClick={onCartOpen}
              aria-label={`Cart — ${itemCount} items`}
              className="relative text-brand-navy hover:text-brand-blue transition-colors"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-accent text-brand-navy text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-contrast/20 bg-white">
          <ul className="flex flex-col py-4">
            {navLinks.filter((l) => l.enabled).map((link) => (
              <>
                <li key={link.id}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-6 py-3 text-[11px] font-heading font-bold uppercase tracking-widest text-brand-navy hover:text-brand-blue transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
                {link.children?.filter((c) => c.enabled).map((child) => (
                  <li key={child.id}>
                    <Link
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block pl-10 pr-6 py-2.5 text-[11px] font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-blue transition-colors"
                    >
                      — {child.label}
                    </Link>
                  </li>
                ))}
              </>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
