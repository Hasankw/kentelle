"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import SearchOverlay from "./SearchOverlay";
import CartDrawer from "./CartDrawer";
import FloatingCart from "./FloatingCart";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";
import { ToastContainer } from "@/components/ui/Toast";
import { useCartStore } from "@/store/cart";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const openCart = useCartStore((s) => s.openCart);
  const setDiscountConfig = useCartStore((s) => s.setDiscountConfig);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    fetch("/api/discount-tiers")
      .then((r) => r.json())
      .then((d) => setDiscountConfig(d.tiers ?? [], d.settings))
      .catch(() => {});
  }, [setDiscountConfig]);

  if (isAdmin) {
    return (
      <>
        {children}
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar
        onSearchOpen={() => setSearchOpen(true)}
        onCartOpen={openCart}
      />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
      <FloatingCart />
      <ChatWidget />
      <ToastContainer />
    </>
  );
}
