"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  name: string;
}

export default function ProductImageGallery({
  images,
  name,
}: ProductImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (idx: number) => {
    setDirection(idx > selected ? 1 : -1);
    setSelected(idx);
  };

  const prev = () => go((selected - 1 + images.length) % images.length);
  const next = () => go((selected + 1) % images.length);

  if (images.length === 0)
    return (
      <div className="aspect-square bg-brand-contrast/10 flex items-center justify-center text-brand-contrast">
        No image
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square bg-brand-contrast/10 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={selected}
            custom={direction}
            initial={{ x: direction * 100 + "%" }}
            animate={{ x: 0 }}
            exit={{ x: direction * -100 + "%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className="absolute inset-0"
          >
            <Image
              src={images[selected]}
              alt={`${name} — image ${selected + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={selected === 0}
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-brand-bg/80 hover:bg-brand-bg text-brand-navy p-1.5 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-bg/80 hover:bg-brand-bg text-brand-navy p-1.5 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`relative w-16 h-16 shrink-0 border-2 transition-colors ${
                i === selected
                  ? "border-brand-navy"
                  : "border-transparent hover:border-brand-contrast/40"
              }`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
