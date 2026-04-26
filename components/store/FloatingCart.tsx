"use client";

import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";

export default function FloatingCart() {
  const { itemCount, openCart } = useCartStore();
  const count = itemCount();

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={openCart}
          className="fixed bottom-6 right-6 z-30 bg-brand-navy text-brand-white w-14 h-14 flex items-center justify-center shadow-xl hover:bg-brand-blue transition-colors md:hidden"
          aria-label={`Open cart — ${count} items`}
        >
          <ShoppingBag size={22} />
          <span className="absolute -top-1 -right-1 bg-brand-blue text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
