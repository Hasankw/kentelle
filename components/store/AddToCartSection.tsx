"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import { toast } from "@/components/ui/Toast";

interface AddToCartSectionProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    images: string[];
    stock: number;
  };
}

export default function AddToCartSection({ product }: AddToCartSectionProps) {
  const [qty, setQty] = useState(1);
  const { addItem, openCart } = useCartStore();
  const outOfStock = product.stock === 0;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] ?? "/images/placeholder.jpg",
        price: product.salePrice ?? product.price,
      });
    }
    toast("success", `${qty}× ${product.name} added to cart`);
    openCart();
  };

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      {!outOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy">
            Qty
          </span>
          <div className="flex items-center border border-brand-contrast/30">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-9 h-9 flex items-center justify-center text-brand-navy hover:bg-brand-navy/5 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-body font-bold text-brand-navy">
              {qty}
            </span>
            <button
              onClick={() => setQty(Math.min(product.stock, qty + 1))}
              className="w-9 h-9 flex items-center justify-center text-brand-navy hover:bg-brand-navy/5 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="text-xs text-brand-contrast font-body">
            {product.stock} in stock
          </span>
        </div>
      )}

      {/* Add to cart */}
      <Button
        onClick={outOfStock ? undefined : handleAdd}
        disabled={outOfStock}
        size="lg"
        className="w-full"
        variant={outOfStock ? "ghost" : "primary"}
      >
        {outOfStock ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
}
