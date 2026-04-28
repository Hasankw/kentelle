"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    tagline: "New Season Collection",
    headline: "Your Skin,\nReimagined",
    sub: "Science-backed formulas for every skin concern. Shop our latest arrivals.",
    cta: { label: "Shop Now", href: "/shop" },
    image: "/images/hero/hero-1.jpg",
  },
  {
    id: 2,
    tagline: "Bestselling Serums",
    headline: "Glow From\nWithin",
    sub: "Our clinically-tested serums deliver visible results in just 4 weeks.",
    cta: { label: "Shop Serums", href: "/collections/serums" },
    image: "/images/hero/hero-2.jpg",
  },
  {
    id: 3,
    tagline: "Find Your Routine",
    headline: "Made For\nAustralian Skin",
    sub: "Every product developed for Australian climate, UV intensity and lifestyle.",
    cta: { label: "Explore All", href: "/shop" },
    image: "/images/hero/hero-3.jpg",
  },
  {
    id: 4,
    tagline: "Skin Regimen",
    headline: "Layer Right,\nGlow Bright",
    sub: "Follow the Kentelle skin layering protocol — morning and night — for transformative results.",
    cta: { label: "View Regimen", href: "/skin-regimen" },
    image: "/images/hero/hero-4.jpg",
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
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const slide = slides[current];

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
          className="absolute inset-0"
        >
          {/* Full-bleed background image */}
          <Image
            src={slide.image}
            alt={slide.headline.replace("\n", " ")}
            fill
            unoptimized
            className="object-cover object-center"
            priority={slide.id === 1}
            sizes="100vw"
          />

          {/* Subtle warm vintage overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(30,20,10,0.25)" }}
          />

          {/* Left text gradient — soft, not too dark */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(14,27,77,0.85) 0%, rgba(14,27,77,0.60) 35%, rgba(14,27,77,0.15) 65%, transparent 100%)",
            }}
          />

          {/* Text content */}
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
              <Link
                href={slide.cta.href}
                className="inline-flex items-center px-8 py-3.5 bg-brand-accent text-brand-navy text-xs font-heading font-bold tracking-widest uppercase hover:bg-brand-accent/85 transition-all duration-200"
              >
                {slide.cta.label}
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide controls */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <button
          onClick={() => go((current - 1 + slides.length) % slides.length, -1)}
          className="text-white/50 hover:text-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > current ? 1 : -1)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-[2px] rounded-full transition-all duration-300 ${
                i === current ? "bg-white w-8" : "bg-white/35 w-2.5 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => go((current + 1) % slides.length, 1)}
          className="text-white/50 hover:text-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
