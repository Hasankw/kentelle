"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";

// Vintage, low-tone real human skincare photography from Unsplash
const slides = [
  {
    id: 1,
    tagline: "New Season Collection",
    headline: "Your Skin,\nReimagined",
    sub: "Science-backed formulas for every skin concern. Shop Kentelle's latest arrivals.",
    cta: { label: "Shop Now", href: "/shop" },
    bg: "#0E1B4D",
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    tagline: "Bestselling Serums",
    headline: "Glow From\nWithin",
    sub: "Our clinically-tested serums deliver visible results in just 4 weeks.",
    cta: { label: "Shop Serums", href: "/collections/serums" },
    bg: "#1a2a5e",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    tagline: "Skin Quiz",
    headline: "Find Your\nPerfect Routine",
    sub: "Not sure where to start? Take our 2-minute skin quiz for personalised recommendations.",
    cta: { label: "Take The Quiz", href: "/quiz" },
    bg: "#0a1535",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=900&q=80",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback((idx: number, dir?: number) => {
    setDirection(dir ?? (idx > current ? 1 : -1));
    setCurrent(idx);
  }, [current]);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % slides.length;
        setDirection(1);
        return next;
      });
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const slide = slides[current];

  return (
    <section
      className="relative h-[540px] md:h-[700px] overflow-hidden"
      style={{ backgroundColor: slide.bg }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          initial={{ x: direction * 100 + "%" }}
          animate={{ x: 0 }}
          exit={{ x: direction * -100 + "%" }}
          transition={{ type: "tween", duration: 0.55 }}
          className="absolute inset-0 flex"
          style={{ backgroundColor: slide.bg }}
        >
          {/* Text side */}
          <div className="relative z-10 flex flex-col justify-center px-8 md:px-20 w-full md:w-1/2">
            <span className="text-[10px] font-heading font-bold tracking-[0.3em] uppercase text-white/50 mb-4">
              {slide.tagline}
            </span>
            <h1 className="font-heading font-bold text-4xl md:text-6xl text-white leading-[1.1] whitespace-pre-line mb-6">
              {slide.headline}
            </h1>
            <p className="font-body text-sm text-white/65 max-w-[280px] mb-9 leading-relaxed">
              {slide.sub}
            </p>
            <Link href={slide.cta.href}>
              <Button
                variant="outline"
                size="lg"
                className="border-white/60 text-white hover:bg-white hover:text-brand-navy w-fit tracking-widest"
              >
                {slide.cta.label}
              </Button>
            </Link>
          </div>

          {/* Image side — desktop only */}
          <div className="hidden md:block relative w-1/2 h-full">
            <Image
              src={slide.image}
              alt={slide.headline.replace("\n", " ")}
              fill
              unoptimized
              className="object-cover object-top"
              priority={slide.id === 1}
              sizes="50vw"
            />
            {/* Vintage warm muted overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "rgba(180,155,130,0.18)",
                mixBlendMode: "multiply",
              }}
            />
            {/* Fade from text side */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${slide.bg} 0%, transparent 25%)`,
              }}
            />
          </div>

          {/* Mobile full-bleed image */}
          <div className="absolute inset-0 md:hidden">
            <Image
              src={slide.image}
              alt={slide.headline.replace("\n", " ")}
              fill
              unoptimized
              className="object-cover object-top"
              sizes="100vw"
            />
            <div className="absolute inset-0" style={{ background: `${slide.bg}cc` }} />
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
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-[3px] rounded-full transition-all duration-400 ${
                i === current ? "bg-white w-8" : "bg-white/30 w-2 hover:bg-white/55"
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
