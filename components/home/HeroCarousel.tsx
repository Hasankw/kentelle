"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
    cta: { label: "Shop Serums", href: "/shop" },
    image: "/images/hero/hero-2.jpg",
  },
  {
    id: 3,
    tagline: "Find Your Routine",
    headline: "Made For\nAustralian Skin",
    sub: "Every product developed for Australian climate, UV intensity and lifestyle.",
    cta: { label: "Find Your Routine", href: "/find-your-routine" },
    image: "/images/hero/hero-3.jpg",
  },
  {
    id: 4,
    tagline: "Skin Regimen",
    headline: "Layer Right,\nGlow Bright",
    sub: "Follow the Kentelle skin layering protocol — morning and night — for transformative results.",
    cta: { label: "Shop Now", href: "/shop" },
    image: "/images/hero/hero-4.jpg",
  },
  {
    id: 5,
    tagline: "Clean Beauty",
    headline: "Feel Good\nIn Your Skin",
    sub: "Gentle, effective formulas that work with your skin — not against it.",
    cta: { label: "Shop Now", href: "/shop" },
    image: "/images/hero/hero-5.jpg",
  },
  {
    id: 6,
    tagline: "Clinical Services",
    headline: "Professional\nSkin Treatments",
    sub: "Our clinical skin services are arriving soon — premium professional treatments for transformative, lasting results.",
    cta: { label: "Learn More", href: "/shop" },
    image: "/images/hero/hero-2.jpg",
    badge: "Coming Soon",
  },
  {
    id: 7,
    tagline: "Diagnosis & Prescription",
    headline: "Expert Skin\nAnalysis",
    sub: "Personalised skin diagnosis and product prescription services — launching in Phase 2.",
    cta: { label: "Shop Now", href: "/shop" },
    image: "/images/hero/hero-4.jpg",
    badge: "Phase 2",
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
    }, 8000);
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
          <Image
            src={slide.image}
            alt={slide.headline.replace("\n", " ")}
            fill
            unoptimized
            className="object-cover object-center"
            priority={slide.id === 1}
            sizes="100vw"
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(58,50,64,0.80) 0%, rgba(58,50,64,0.52) 38%, rgba(58,50,64,0.10) 62%, transparent 82%)",
            }}
          />

          <div className="relative z-10 h-full flex items-center">
            <div className="px-8 md:px-20 max-w-lg">
              {(slide as any).badge && (
                <span className="inline-block mb-3 px-3 py-1 bg-brand-accent text-brand-navy rounded text-[10px] font-heading font-bold tracking-widest uppercase">
                  {(slide as any).badge}
                </span>
              )}
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
                className="inline-flex items-center px-8 py-3.5 bg-brand-accent text-brand-navy rounded text-xs font-heading font-bold tracking-widest uppercase hover:bg-brand-accent/85 transition-all duration-200"
              >
                {slide.cta.label}
              </Link>
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
