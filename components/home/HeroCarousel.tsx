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
    bg: "#051D49",
    image: "/images/hero-1.jpg",
  },
  {
    id: 2,
    tagline: "Bestselling Serums",
    headline: "Glow From\nWithin",
    sub: "Our clinically-tested serums deliver visible results in just 4 weeks.",
    cta: { label: "Shop Serums", href: "/collections/serums" },
    bg: "#4770DB",
    image: "/images/hero-2.jpg",
  },
  {
    id: 3,
    tagline: "Skin Quiz",
    headline: "Find Your\nPerfect Routine",
    sub: "Not sure where to start? Take our 2-minute skin quiz for personalised recommendations.",
    cta: { label: "Take The Quiz", href: "/quiz" },
    bg: "#0E1B4D",
    image: "/images/hero-3.jpg",
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
    const id = setInterval(() => go((current + 1) % slides.length), 5000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

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
          <div className="flex-1 flex flex-col justify-center px-8 md:px-20 z-10">
            <span className="text-xs font-heading font-bold tracking-widest uppercase text-brand-white/60 mb-3">
              {slide.tagline}
            </span>
            <h1 className="font-heading font-bold text-4xl md:text-6xl text-brand-white leading-tight whitespace-pre-line mb-5">
              {slide.headline}
            </h1>
            <p className="font-body text-sm md:text-base text-brand-white/75 max-w-xs mb-8 leading-relaxed">
              {slide.sub}
            </p>
            <Link href={slide.cta.href}>
              <Button
                variant="outline"
                size="lg"
                className="border-brand-white text-brand-white hover:bg-brand-white hover:text-brand-navy w-fit"
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
              onError={() => {}}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-current/20 to-transparent" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <button
          onClick={prev}
          className="text-brand-white/60 hover:text-brand-white transition-colors"
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
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-brand-white w-6"
                  : "bg-brand-white/30 hover:bg-brand-white/60"
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="text-brand-white/60 hover:text-brand-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
