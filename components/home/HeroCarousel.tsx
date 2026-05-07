"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    tagline: "Science-Backed Skincare",
    headline: "KENTELLE",
    sub: "Treat yourself, beauty you can telle.",
    cta: { label: "Shop All", href: "/shop" },
    cta2: { label: "About Us", href: "/about" },
    image: "/images/hero/hero-slide1.png",
  },
  {
    id: 2,
    tagline: "Everyday Essentials",
    headline: "Everyday\nEssentials Care",
    sub: "It's a lifetime care, no shortcuts.",
    cta: { label: "Shop Collection", href: "/collections/everyday-essentials" },
    image: "/images/hero/hero-slide2.jpg",
  },
  {
    id: 3,
    tagline: "Peel & Glow",
    headline: "Peel and\nGlow",
    sub: "Absorb, resurfacing, restore and anti-ageing.",
    cta: { label: "Shop Collection", href: "/collections/peel-and-glow" },
    image: "https://siwgptjhirmkabyjmddm.supabase.co/storage/v1/object/public/products/hero-peel-and-glow-new.jpg",
  },
  {
    id: 4,
    tagline: "Skin Nutrients",
    headline: "Skin\nNutrients",
    sub: "Feed the skin to stay youthful.",
    cta: { label: "Shop Collection", href: "/collections/skin-nutrients" },
    image: "/images/hero/hero-slide4.jpg",
  },
  {
    id: 5,
    tagline: "Beauty Accessories",
    headline: "Beauty\nAccessories",
    sub: "The support act your skin deserves.",
    cta: { label: "Shop Collection", href: "/collections/beauty-accessories" },
    image: "/images/hero/hero-beauty-accessories.jpg",
  },
  {
    id: 6,
    tagline: "Professional Use",
    headline: "The Professional's\nSecret",
    sub: "KENTELLE: The Professional's Secret to Clinical Excellence.",
    cta: { label: "Shop Collection", href: "/collections/professional-use" },
    image: "/images/hero/hero-professional-use.jpg",
  },
  {
    id: 7,
    tagline: "Diagnosis & Prescription",
    headline: "What's Your\nSkin Concern?",
    sub: "Personalised skin diagnosis and product prescription to find your perfect routine.",
    cta: { label: "Find Your Routine", href: "/find-your-routine" },
    image: "/images/hero/hero-slide7.jpg",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setCurrent(idx);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => {
        setDirection(1);
        return (c + 1) % slides.length;
      });
    }, 12000);
    return () => clearInterval(id);
  }, []);

  const slide = slides[current];

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x < -60) {
        go((current + 1) % slides.length, 1);
      } else if (info.offset.x > 60) {
        go((current - 1 + slides.length) % slides.length, -1);
      }
    },
    [current, go]
  );

  return (
    <section className="relative h-[540px] md:h-[700px] overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          initial={{ x: direction * 100 + "%" }}
          animate={{ x: 0 }}
          exit={{ x: direction * -100 + "%" }}
          transition={{ type: "tween", duration: 0.55 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <Image
            src={slide.image}
            alt={slide.headline.replace(/\n/g, " ")}
            fill
            unoptimized
            className="object-cover object-center"
            priority={slide.id === 1}
            sizes="100vw"
          />

          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 35%, transparent 65%)",
            }}
          />

          <div className="relative z-10 h-full flex items-center">
            <div className="px-8 md:px-20 max-w-lg">
              <span className="text-[10px] font-heading font-bold tracking-[0.3em] uppercase text-white/60 block mb-4">
                {slide.tagline}
              </span>
              <h1 className="font-heading font-bold text-4xl md:text-6xl text-white leading-[1.1] whitespace-pre-line mb-6">
                {slide.headline}
              </h1>
              <p className="font-body text-sm text-white/75 max-w-[300px] mb-9 leading-relaxed">
                {slide.sub}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href={slide.cta.href}
                  className="inline-flex items-center px-8 py-3.5 bg-brand-accent text-brand-navy rounded text-xs font-heading font-bold tracking-widest uppercase hover:bg-brand-accent/85 transition-all duration-200"
                >
                  {slide.cta.label}
                </Link>
                {(slide as any).cta2 && (
                  <Link
                    href={(slide as any).cta2.href}
                    className="inline-flex items-center px-8 py-3.5 bg-transparent border border-white/60 text-white rounded text-xs font-heading font-bold tracking-widest uppercase hover:bg-white/10 transition-all duration-200"
                  >
                    {(slide as any).cta2.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Vertical bubble navigation — right edge */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i, i > current ? 1 : -1)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-2.5 h-2.5 bg-white shadow-md"
                : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
