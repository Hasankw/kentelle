"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export interface CarouselSlide {
  id: string;
  tagline: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  cta2Label?: string;
  cta2Href?: string;
  image: string;
  enabled: boolean;
  sortOrder: number;
}

const FALLBACK: CarouselSlide[] = [
  { id: "1", tagline: "Science-Backed Skincare", headline: "KENTELLE", sub: "Treat yourself, beauty you can telle.", ctaLabel: "Shop All", ctaHref: "/shop", cta2Label: "About Us", cta2Href: "/about", image: "/images/hero/hero-slide1.png", enabled: true, sortOrder: 0 },
  { id: "2", tagline: "Everyday Essentials", headline: "Everyday\nEssentials Care", sub: "It's a lifetime care, no shortcuts.", ctaLabel: "Shop Collection", ctaHref: "/collections/everyday-essentials", image: "/images/hero/hero-slide2.jpg", enabled: true, sortOrder: 1 },
  { id: "3", tagline: "Peel & Glow", headline: "Peel and\nGlow", sub: "Absorb, resurfacing, restore and anti-ageing.", ctaLabel: "Shop Collection", ctaHref: "/collections/peel-and-glow", image: "https://siwgptjhirmkabyjmddm.supabase.co/storage/v1/object/public/products/hero-peel-and-glow-new.jpg", enabled: true, sortOrder: 2 },
  { id: "4", tagline: "Skin Nutrients", headline: "Skin\nNutrients", sub: "Feed the skin to stay youthful.", ctaLabel: "Shop Collection", ctaHref: "/collections/skin-nutrients", image: "/images/hero/hero-slide4.jpg", enabled: true, sortOrder: 3 },
  { id: "5", tagline: "Beauty Accessories", headline: "Beauty\nAccessories", sub: "The support act your skin deserves.", ctaLabel: "Shop Collection", ctaHref: "/collections/beauty-accessories", image: "/images/hero/hero-beauty-accessories.jpg", enabled: true, sortOrder: 4 },
  { id: "6", tagline: "Professional Use", headline: "The Professional's\nSecret", sub: "KENTELLE: The Professional's Secret to Clinical Excellence.", ctaLabel: "Shop Collection", ctaHref: "/collections/professional-use", image: "/images/hero/hero-professional-use.jpg", enabled: true, sortOrder: 5 },
  { id: "7", tagline: "Diagnosis & Prescription", headline: "What's Your\nSkin Concern?", sub: "Personalised skin diagnosis and product prescription to find your perfect routine.", ctaLabel: "Find Your Routine", ctaHref: "/find-your-routine", image: "/images/hero/hero-slide7.jpg", enabled: true, sortOrder: 6 },
];

export default function HeroCarousel({ initialSlides }: { initialSlides?: CarouselSlide[] }) {
  const slides = (initialSlides ?? FALLBACK).filter((s) => s.enabled).sort((a, b) => a.sortOrder - b.sortOrder);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setCurrent(idx);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => { setDirection(1); return (c + 1) % slides.length; });
    }, 12000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;

  const slide = slides[current] ?? slides[0];

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x < -60) go((current + 1) % slides.length, 1);
      else if (info.offset.x > 60) go((current - 1 + slides.length) % slides.length, -1);
    },
    [current, go, slides.length]
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
            priority={slide.id === slides[0]?.id}
            sizes="100vw"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 35%, transparent 65%)" }} />
          <div className="relative z-10 h-full flex items-center">
            <div className="px-8 md:px-20 max-w-lg">
              <span className="text-[10px] font-heading font-bold tracking-[0.3em] uppercase text-white/60 block mb-4">{slide.tagline}</span>
              <h1 className="font-heading font-bold text-4xl md:text-6xl text-white leading-[1.1] whitespace-pre-line mb-6">{slide.headline}</h1>
              <p className="font-body text-sm text-white/75 max-w-[300px] mb-9 leading-relaxed">{slide.sub}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link href={slide.ctaHref} className="inline-flex items-center px-8 py-3.5 bg-brand-accent text-brand-navy rounded text-xs font-heading font-bold tracking-widest uppercase hover:bg-brand-accent/85 transition-all duration-200">
                  {slide.ctaLabel}
                </Link>
                {slide.cta2Label && slide.cta2Href && (
                  <Link href={slide.cta2Href} className="inline-flex items-center px-8 py-3.5 bg-transparent border border-white/60 text-white rounded text-xs font-heading font-bold tracking-widest uppercase hover:bg-white/10 transition-all duration-200">
                    {slide.cta2Label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => go(i, i > current ? 1 : -1)} aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${i === current ? "w-2.5 h-2.5 bg-white shadow-md" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </section>
  );
}
