"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatPrice, calcDiscount } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Pick<
    Product,
    "id" | "name" | "slug" | "price" | "salePrice" | "images" | "stock"
  >;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const image1 = product.images[0] ?? "/images/placeholder.jpg";
  const image2 = product.images[1] ?? image1;
  const discount = product.salePrice
    ? calcDiscount(product.price, product.salePrice)
    : 0;
  const outOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: image1,
      price: product.salePrice ?? product.price,
    });
    router.push("/cart");
  };

  return (
    <div className="group">
      <Link href={`/products/${product.slug}`}>
        {/* Image container */}
        <div
          className="relative aspect-[3/4] bg-brand-contrast/10 overflow-hidden mb-3"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Primary image */}
          <Image
            src={image1}
            alt={product.name}
            fill
            unoptimized={image1.startsWith("http")}
            className={`object-cover transition-opacity duration-500 ${
              hovered ? "opacity-0" : "opacity-100"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* Hover image */}
          <Image
            src={image2}
            alt={product.name}
            fill
            unoptimized={image2.startsWith("http")}
            className={`object-cover transition-opacity duration-500 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge variant="sale">-{discount}%</Badge>
            )}
            {outOfStock && (
              <Badge variant="soldout">Sold Out</Badge>
            )}
          </div>

          {/* Quick-add button */}
          {!outOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-0 left-0 right-0 bg-brand-accent text-brand-navy rounded py-3 text-xs font-heading font-bold tracking-widest uppercase flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-brand-accent/85"
            >
              <ShoppingBag size={14} />
              Add to Cart
            </button>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="font-heading font-bold text-sm text-brand-navy group-hover:text-brand-blue transition-colors truncate">
            {product.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {product.salePrice ? (
              <>
                <span className="font-body text-sm text-brand-blue font-bold">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="font-body text-xs text-brand-contrast line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="font-body text-sm text-brand-navy">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
