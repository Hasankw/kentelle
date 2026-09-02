"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";
import { MOTHERS_DAY_BUNDLE } from "@/lib/bundles";
import {
  DEFAULT_DISCOUNT_SETTINGS,
  tierDiscountAmount,
  nextTierMessage as computeNextTierMessage,
  type DiscountTier,
  type DiscountSettings,
} from "@/lib/discount-tiers";

interface AppliedCoupon {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
}

interface AppliedGiftCard {
  code: string;
  amount: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  coupon: AppliedCoupon | null;
  giftCard: AppliedGiftCard | null;
  discountTiers: DiscountTier[];
  discountSettings: DiscountSettings;

  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  total: () => number;
  itemCount: () => number;
  applyCoupon: (c: AppliedCoupon) => void;
  removeCoupon: () => void;
  applyGiftCard: (gc: AppliedGiftCard) => void;
  removeGiftCard: () => void;
  setDiscountConfig: (tiers: DiscountTier[], settings: DiscountSettings) => void;
  /** Automatic basket-value tier discount — no code required. Suppressed
   * (not stacked) when a coupon is applied and tiers aren't marked
   * combinable with coupons. */
  tierDiscount: () => number;
  /** "Spend another $X to unlock Y% off" — null once the top tier is hit. */
  nextTierMessage: () => string | null;
  discount: () => number;
  bundleDiscount: () => number;
  discountedTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,
      giftCard: null,
      discountTiers: [],
      discountSettings: DEFAULT_DISCOUNT_SETTINGS,

      addItem: (incoming) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === incoming.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === incoming.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...incoming, quantity: 1 }] };
        });
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], coupon: null, giftCard: null }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      applyCoupon: (c) => set({ coupon: c }),
      removeCoupon: () => set({ coupon: null }),
      applyGiftCard: (gc) => set({ giftCard: gc }),
      removeGiftCard: () => set({ giftCard: null }),
      setDiscountConfig: (discountTiers, discountSettings) => set({ discountTiers, discountSettings }),

      tierDiscount: () => {
        const { coupon, discountTiers, discountSettings } = get();
        if (coupon && !discountSettings.combinableWithCoupons) return 0;
        return tierDiscountAmount(get().total(), discountTiers);
      },

      nextTierMessage: () => computeNextTierMessage(get().total(), get().discountTiers),

      bundleDiscount: () => {
        const items = get().items;
        let d = 0;
        for (const item of items) {
          if (MOTHERS_DAY_BUNDLE.productIds.includes(item.id)) {
            const pairs = Math.floor(item.quantity / 2);
            d += pairs * MOTHERS_DAY_BUNDLE.savingsPerPair;
          }
        }
        return d;
      },

      discount: () => {
        const raw = get().total();
        const { coupon, giftCard } = get();
        let d = get().bundleDiscount() + get().tierDiscount();
        if (coupon) {
          d += coupon.type === "PERCENTAGE"
            ? raw * (coupon.value / 100)
            : Math.min(coupon.value, raw);
        }
        if (giftCard) {
          d += Math.min(giftCard.amount, raw - d);
        }
        return Math.min(d, raw);
      },

      discountedTotal: () => Math.max(get().total() - get().discount(), 0),
    }),
    {
      name: "kentelle-cart",
      partialize: (state) => ({ items: state.items, coupon: state.coupon, giftCard: state.giftCard }),
    }
  )
);
