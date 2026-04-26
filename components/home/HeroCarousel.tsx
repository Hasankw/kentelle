"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";

const slides = [
  {
    id: 1,
    tagline: "New Season Collection",
    headline: "Your Skin,\nReimagined",
    sub: "Science-backed formulas for every skin concern. Shop Kentelle's latest arrivals.",
    cta: { label: "Shop Now", href: "/shop" },
    bg: "#0E1B4D",
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    tagline: "Bestselling Serums",
    headline: "Glow From\nWithin",
    sub: "Our clinically-tested serums deliver visible results in just 4 weeks.",
    cta: { label: "Shop Serums", href: "/collections/serums" },
    bg: "#4770DB",
    image: "https://images.unsplash.com/photo-1556228720-da9e5b2a3519?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    tagline: "Skin Quiz",
    headline: "Find Your\nPerfect Routine",
    sub: "Not sure where to start? Take our 2-minute skin quiz for personalised recommendations.",
    cta: { label: "Take The Quiz", href: "/quiz" },
    bg: "#1a2a5e",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=85",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const prev = () => go((current - 1 + slides.length) % slides.length);
  const next = () => go((current + 1) % slides.length);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
      setDirection(1);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const slide = slides[current];

  return (
    <section
      className="relative h-[520px] md:h-[680px] overflow-hidden"
      style={{ backgroundColor: slide.bg }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          initial={{ x: direction * 100 + "%" }}
          animate={{ x: 0 }}
          exit={{ x: direction * -100 + "%" }}
          transition={{ type: "tween", duration: 0.5 }}
          className="absolute inset-0 flex"
          style={{ backgroundColor: slide.bg }}
        >
          {/* Text side */}
          <div className="flex-1 flex flex-col justify-center px-8 md:px-20 z-10 max-w-xl">
            <span className="text-xs font-heading font-bold tracking-widest uppercase text-white/60 mb-3">
              {slide.tagline}
            </span>
            <h1 className="font-heading font-bold text-4xl md:text-6xl text-white leading-tight whitespace-pre-line mb-5">
              {slide.headline}
            </h1>
            <p className="font-body text-sm md:text-base text-white/75 max-w-xs mb-8 leading-relaxed">
              {slide.sub}
            </p>
            <Link href={slide.cta.href}>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-brand-navy w-fit"
              >
                {slide.cta.label}
              </Button>
            </Link>
          </div>

          {/* Image side */}
          <div className="hidden md:block relative flex-1">
            <Image
              src={slide.image}
              alt={slide.headline.replace("\n", " ")}
              fill
              className="object-cover object-center"
              priority={current === 0}
              sizes="50vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${slide.bg} 0%, transparent 30%)`,
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <button
          onClick={prev}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-white w-8"
                  : "bg-white/30 w-1.5 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
