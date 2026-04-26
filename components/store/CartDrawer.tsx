"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } =
    useCartStore();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-brand-bg z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-contrast/20">
              <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-brand-navy">
                Your Cart ({items.length})
              </h2>
              <button
                onClick={closeCart}
                className="text-brand-contrast hover:text-brand-navy transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-brand-contrast">
                  <ShoppingBag size={48} className="opacity-30" />
                  <p className="font-body text-sm">Your cart is empty</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeCart}
                    className="mt-2"
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-brand-contrast/10">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 p-4">
                      <div className="relative w-20 h-20 bg-brand-contrast/10 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-sm text-brand-navy truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-brand-blue font-body mt-0.5">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-6 h-6 flex items-center justify-center border border-brand-contrast/30 text-brand-navy hover:border-brand-navy transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-body w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-6 h-6 flex items-center justify-center border border-brand-contrast/30 text-brand-navy hover:border-brand-navy transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-brand-contrast hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <p className="text-sm font-heading font-bold text-brand-navy">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-brand-contrast/20 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-brand-navy/70">
                    Subtotal
                  </span>
                  <span className="font-heading font-bold text-brand-navy">
                    {formatPrice(total())}
                  </span>
                </div>
                <p className="text-xs text-brand-contrast">
                  Shipping calculated at checkout
                </p>
                <Link href="/checkout" onClick={closeCart}>
                  <Button className="w-full" size="lg">
                    Checkout
                  </Button>
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full text-xs text-brand-contrast hover:text-brand-navy underline underline-offset-2 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
