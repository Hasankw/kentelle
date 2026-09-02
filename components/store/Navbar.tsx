"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, User, Menu, X, ChevronDown } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

type SimpleLink = { label: string; href: string; badge?: string };
type MegaColumn = { heading: string; items: SimpleLink[] };
type MegaFeature = { image: string; label: string; caption: string; href: string };
type MegaCard = { image: string; title: string; description: string; href: string };

type NavItem =
  | { kind: "link"; id: string; label: string; href: string }
  | { kind: "dropdown"; id: string; label: string; href: string; items: SimpleLink[] }
  | { kind: "mega"; id: string; label: string; href: string; columns: MegaColumn[]; feature: MegaFeature; width: string }
  | { kind: "quiz-mega"; id: string; label: string; eyebrow: string; heading: string; headingEmphasis: string; subtext: string; cards: MegaCard[]; width: string };

const SHOP_COLUMNS: MegaColumn[] = [
  {
    heading: "Featured",
    items: [
      { label: "All Products", href: "/shop" },
      { label: "Everyday Essentials", href: "/collections/everyday-essentials", badge: "Bestseller" },
      { label: "Layering Guide", href: "/product-layering" },
    ],
  },
  {
    heading: "Cleanse & Treat",
    items: [
      { label: "Cleansers", href: "/collections/cleansers" },
      { label: "Toners", href: "/collections/toners" },
      { label: "Exfoliators", href: "/collections/exfoliators" },
      { label: "Serums", href: "/collections/serums" },
      { label: "Peel & Glow", href: "/collections/peel-and-glow" },
    ],
  },
  {
    heading: "Care & More",
    items: [
      { label: "Moisturisers", href: "/collections/moisturisers" },
      { label: "Eye Care", href: "/collections/eye-care" },
      { label: "Skin Nutrients", href: "/collections/skin-nutrients" },
      { label: "Face Masks", href: "/collections/face-masks" },
      { label: "Sun Care", href: "/collections/sun-care" },
      { label: "Professional Use", href: "/collections/professional-use" },
      { label: "Beauty Accessories", href: "/collections/beauty-accessories" },
    ],
  },
];

const SHOP_FEATURE: MegaFeature = {
  image: "/images/products/derma-glycolic-10-serum-ampoules.jpg",
  label: "Top Pick",
  caption: "Derma Glycolic 10 Serum Ampoules",
  href: "/products/derma-glycolic-10-serum-ampoules",
};

const LEARN_COLUMNS: MegaColumn[] = [
  {
    heading: "The Brand",
    items: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    heading: "Stories",
    items: [{ label: "Blog", href: "/blog" }],
  },
];

const LEARN_FEATURE: MegaFeature = {
  image: "/images/about/about-banner.jpg",
  label: "The Brand",
  caption: "Meet Kentelle",
  href: "/about",
};

const QUIZ_MEGA_CARDS: MegaCard[] = [
  {
    image: "/images/hero/hero-brand.jpg",
    title: "Take the Skin Quiz",
    description: "Answer a few questions and get a routine built for your exact skin.",
    href: "/skin-quiz",
  },
  {
    image: "/images/hero/hero-serums.jpg",
    title: "Sample Routines",
    description: "Browse routines built for specific concerns before you commit.",
    href: "/routines",
  },
];

const NAV_ITEMS: NavItem[] = [
  {
    kind: "quiz-mega",
    id: "skin-quiz",
    label: "Skin Quiz",
    eyebrow: "Personalized Skincare",
    heading: "Your skin,",
    headingEmphasis: "understood.",
    subtext: "Take our 3-minute quiz. We read your concerns, sensitivity and lifestyle, then match you to a Kentelle routine built for you.",
    cards: QUIZ_MEGA_CARDS,
    width: "640px",
  },
  { kind: "mega", id: "shop", label: "Shop", href: "/shop", columns: SHOP_COLUMNS, feature: SHOP_FEATURE, width: "940px" },
  { kind: "mega", id: "learn", label: "Learn", href: "/about", columns: LEARN_COLUMNS, feature: LEARN_FEATURE, width: "580px" },
  { kind: "link", id: "reviews", label: "Reviews", href: "/#reviews" },
];

interface NavbarProps {
  onSearchOpen: () => void;
  onCartOpen: () => void;
}

export default function Navbar({ onSearchOpen, onCartOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("");
  const pathname = usePathname();
  const rawItemCount = useCartStore((s) => s.itemCount());
  // The cart persists to localStorage, so the real count is only known
  // client-side — rendering it on the first client pass (before this effect
  // runs) would mismatch the server-rendered "0" and force React to
  // regenerate the whole tree, which can wipe in-flight UI state (e.g. mid
  // quiz-flow). Stay at 0 until after mount, matching SSR exactly.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const itemCount = mounted ? rawItemCount : 0;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openNow = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(id);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

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

  const openItem = NAV_ITEMS.find((i) => i.id === openMenu && i.kind !== "link");

  return (
    <div id="site-header" className="sticky top-0 z-40 px-3 sm:px-4 pt-3">
      <nav
        className={cn(
          "max-w-6xl mx-auto bg-white/95 backdrop-blur-md rounded-full border border-brand-contrast/10 transition-shadow duration-200",
          scrolled ? "shadow-lg" : "shadow-sm"
        )}
      >
        <div className="px-3 sm:px-6 lg:px-8">
          {/* This row is the positioning anchor for mega menu panels below —
              top-full on the panel lands exactly on the pill's bottom edge,
              with zero JS measurement needed regardless of the marquee's
              (non-sticky) height or scroll position. */}
          <div className="relative flex items-center justify-between h-14 md:h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden text-brand-navy shrink-0 relative z-10"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 font-heading font-bold text-sm sm:text-base md:text-xl tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.2em] uppercase text-brand-navy whitespace-nowrap"
            >
              Kentelle
            </Link>

            {/* Desktop nav triggers */}
            <ul className="hidden md:flex items-center gap-8 md:absolute md:left-1/2 md:-translate-x-1/2">
              {NAV_ITEMS.map((item) => (
                <li
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => item.kind !== "link" && openNow(item.id)}
                  onMouseLeave={() => item.kind !== "link" && scheduleClose()}
                >
                  {item.kind === "quiz-mega" ? (
                    <span className="flex items-center gap-1 text-[11px] font-heading font-bold uppercase tracking-widest text-brand-navy py-2 cursor-default select-none">
                      {item.label}
                      <ChevronDown size={13} className="mt-px" />
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center gap-1 text-[11px] font-heading font-bold uppercase tracking-widest text-brand-navy hover:text-brand-blue transition-colors py-2"
                    >
                      {item.label}
                      {item.kind !== "link" && <ChevronDown size={13} className="mt-px" />}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Mega menu panel — a single shared instance anchored to this
                row's own bottom edge (top-full), centered under the pill via
                left-1/2, independent of which trigger is hovered. */}
            {openItem && (
              <div
                className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 pt-1 z-50"
                onMouseEnter={() => openNow(openItem.id)}
                onMouseLeave={scheduleClose}
              >
                {openItem.kind === "quiz-mega" && (
                  <div
                    className="bg-white border border-brand-contrast/10 shadow-xl rounded-2xl p-8 max-w-[90vw] grid grid-cols-[220px_1fr] gap-10"
                    style={{ width: openItem.width }}
                  >
                    <div>
                      <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast/70 mb-3">
                        {openItem.eyebrow}
                      </p>
                      <p className="font-heading font-bold text-2xl text-brand-navy leading-tight mb-3">
                        {openItem.heading}
                        <br />
                        <em className="not-italic text-brand-blue">{openItem.headingEmphasis}</em>
                      </p>
                      <p className="font-body text-xs text-brand-contrast leading-relaxed">{openItem.subtext}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      {openItem.cards.map((card) => (
                        <Link key={card.href} href={card.href} className="block group/card">
                          <div className="relative aspect-[4/3] bg-brand-bg rounded-lg overflow-hidden mb-3">
                            <Image
                              src={card.image}
                              alt=""
                              fill
                              className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-[13px] font-heading font-bold text-brand-navy group-hover/card:text-brand-blue transition-colors mb-1">
                            {card.title}
                          </p>
                          <p className="font-body text-[11px] text-brand-contrast leading-relaxed">{card.description}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {openItem.kind === "dropdown" && (
                  <div className="bg-white border border-brand-contrast/10 shadow-lg rounded-2xl min-w-[190px] py-1">
                    {openItem.items.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2.5 text-[11px] font-heading font-bold uppercase tracking-widest text-brand-navy hover:bg-brand-bg hover:text-brand-blue transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}

                {openItem.kind === "mega" && (
                  <div
                    className="bg-white border border-brand-contrast/10 shadow-xl rounded-2xl p-8 max-w-[90vw] grid gap-8"
                    style={{ width: openItem.width, gridTemplateColumns: `repeat(${openItem.columns.length + 1}, minmax(0, 1fr))` }}
                  >
                    {openItem.columns.map((col) => (
                      <div key={col.heading}>
                        <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast/70 mb-3">
                          {col.heading}
                        </p>
                        <ul className="space-y-2.5">
                          {col.items.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="inline-flex flex-col items-start gap-1 whitespace-nowrap text-[13px] font-heading font-bold text-brand-navy hover:text-brand-blue transition-colors"
                              >
                                {link.badge && (
                                  <span className="shrink-0 text-[8px] leading-none font-heading font-bold uppercase tracking-wider bg-brand-accent/30 text-brand-navy px-1.5 py-1 rounded">
                                    {link.badge}
                                  </span>
                                )}
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <div>
                      <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast/70 mb-3">
                        {openItem.feature.label}
                      </p>
                      <Link href={openItem.feature.href} className="block group/feature">
                        <div className="relative aspect-square bg-brand-bg rounded-lg overflow-hidden mb-2">
                          <Image
                            src={openItem.feature.image}
                            alt=""
                            fill
                            className="object-cover group-hover/feature:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-[12px] font-heading font-bold text-brand-navy group-hover/feature:text-brand-blue transition-colors">
                          {openItem.feature.caption}
                        </p>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Icons */}
            <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 md:gap-4 shrink-0">
              <button
                onClick={onSearchOpen}
                aria-label="Search"
                className="text-brand-navy hover:text-brand-blue transition-colors"
              >
                <Search size={17} className="md:hidden" />
                <Search size={20} className="hidden md:block" />
              </button>
              <Link
                href={greeting ? "/account" : `/login?redirect=${encodeURIComponent(pathname)}`}
                aria-label="Account"
                className="flex items-center gap-1.5 text-brand-navy hover:text-brand-blue transition-colors"
              >
                <User size={17} className="md:hidden" />
                <User size={20} className="hidden md:block" />
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
                <ShoppingBag size={17} className="md:hidden" />
                <ShoppingBag size={20} className="hidden md:block" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-accent text-brand-navy text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-brand-contrast/10 max-h-[75vh] overflow-y-auto">
          <ul className="flex flex-col py-4">
            {NAV_ITEMS.map((item) => {
              const expanded = mobileExpanded === item.id;
              const hasSubmenu = item.kind !== "link";
              return (
                <li key={item.id}>
                  <div className="flex items-center">
                    {item.kind === "quiz-mega" ? (
                      <button
                        onClick={() => setMobileExpanded(expanded ? null : item.id)}
                        className="flex-1 text-left px-6 py-3 text-[11px] font-heading font-bold uppercase tracking-widest text-brand-navy"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 block px-6 py-3 text-[11px] font-heading font-bold uppercase tracking-widest text-brand-navy hover:text-brand-blue transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                    {hasSubmenu && (
                      <button
                        onClick={() => setMobileExpanded(expanded ? null : item.id)}
                        aria-label={`Toggle ${item.label} submenu`}
                        className="px-6 py-3 text-brand-navy"
                      >
                        <ChevronDown size={16} className={cn("transition-transform", expanded && "rotate-180")} />
                      </button>
                    )}
                  </div>

                  {hasSubmenu && expanded && item.kind === "quiz-mega" && (
                    <div className="pl-10 pr-6 pb-3">
                      <p className="font-body text-[11px] text-brand-contrast leading-relaxed mb-3">{item.subtext}</p>
                      <ul className="space-y-1.5">
                        {item.cards.map((card) => (
                          <li key={card.href}>
                            <Link
                              href={card.href}
                              onClick={() => setMobileOpen(false)}
                              className="block py-1 text-[11px] font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-blue transition-colors"
                            >
                              — {card.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {hasSubmenu && expanded && item.kind === "dropdown" && (
                    <ul>
                      {item.items.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="block pl-10 pr-6 py-2.5 text-[11px] font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-blue transition-colors"
                          >
                            — {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  {hasSubmenu && expanded && item.kind === "mega" && (
                    <div className="pl-10 pr-6 pb-3">
                      {item.columns.map((col) => (
                        <div key={col.heading} className="mb-3">
                          <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast/60 mb-1.5">
                            {col.heading}
                          </p>
                          <ul className="space-y-1.5">
                            {col.items.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="block py-1 text-[11px] font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-blue transition-colors"
                                >
                                  — {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <Link
                        href={item.feature.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-1 text-[11px] font-heading font-bold uppercase tracking-widest text-brand-blue"
                      >
                        — {item.feature.caption}
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
