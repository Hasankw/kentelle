"use client";

import { useCartStore } from "@/store/cart";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  offerId: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  qty: number;
  bundlePrice: number;
}

export default function AddBundleButton({
  offerId,
  productId,
  productName,
  productSlug,
  productImage,
  qty,
  bundlePrice,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      id: `${productId}-bundle-${qty}`,
      name: `${productName} — Bundle × ${qty}`,
      slug: productSlug,
      image: productImage,
      price: bundlePrice,
    });
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <button
      onClick={handleAdd}
      className="w-full flex items-center justify-center gap-2 py-3 text-xs font-heading font-bold uppercase tracking-widest transition-colors rounded"
      style={
        added
          ? { background: "#22c55e", color: "white" }
          : { background: "#3A3240", color: "white" }
      }
    >
      {added ? <Check size={14} /> : <ShoppingBag size={14} />}
      {added ? "Added to Cart!" : `Add Bundle to Cart`}
    </button>
  );
}
