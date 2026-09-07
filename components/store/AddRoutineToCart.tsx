"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";

type RoutineCartProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
  categoryIds: string[];
};

export default function AddRoutineToCart({ products }: { products: RoutineCartProduct[] }) {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    for (const product of products) {
      useCartStore.getState().addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] ?? "/images/placeholder.svg",
        price: product.salePrice ?? product.price,
        categoryIds: product.categoryIds,
      });
    }
    router.replace("/cart");
  }, [products, router]);

  return (
    <div className="min-h-[55vh] flex items-center justify-center px-5 bg-brand-bg">
      <div className="text-center">
        <div className="w-9 h-9 mx-auto mb-5 rounded-full border-2 border-brand-accent border-t-transparent animate-spin" />
        <p className="font-heading font-bold text-lg text-brand-navy mb-2">Adding your routine to cart</p>
        <p className="font-body text-sm text-brand-contrast">{products.length} product{products.length === 1 ? "" : "s"} from your prescription&hellip;</p>
      </div>
    </div>
  );
}
