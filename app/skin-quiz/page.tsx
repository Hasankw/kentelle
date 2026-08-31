"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const STEPS = [
  { stat: "3 min", title: "Take the quiz", body: "Your concerns, sensitivity, skin type and lifestyle — mapped in a few taps." },
  { stat: "1 profile", title: "We read your skin", body: "Answers are cross-referenced against Kentelle's dermal-grade formulations." },
  { stat: "1 routine", title: "Get your routine", body: "A cleanser-to-moisturiser system built around what your skin actually needs." },
];

const PRODUCTS = [
  { name: "Personalised Cleanser", body: "Matched to your barrier and reactivity", img: "/images/products/ceramide-cleanser.jpg" },
  { name: "Targeted Treatment", body: "Actives selected for your specific concerns", img: "/images/products/derma-moisture-fix.jpg" },
  { name: "Moisturiser", body: "Seals the barrier, day and night", img: "/images/products/bio-ferment-barrier-cream.jpg" },
];

export default function SkinQuizLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <main className="flex-grow">
        {/* Hero */}
        <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/hero/hero-brand.jpg"
              alt=""
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/40 to-transparent" />
          </div>
          <div className="relative z-10 max-w-2xl px-6 md:px-16 py-24">
            <p className="font-heading text-xs font-bold tracking-[0.3em] uppercase text-brand-accent mb-4">
              Kentelle Skin Quiz
            </p>
            <h1 className="font-heading font-bold text-4xl md:text-6xl text-brand-white leading-[1.05] mb-5">
              Understand Your Skin.<br />
              <em className="not-italic text-brand-accent">Discover Your Routine.</em>
            </h1>
            <p className="font-body text-base md:text-lg text-brand-white/85 mb-2 max-w-md">
              Your skin is unique — your skincare should be too.
            </p>
            <p className="font-body text-sm md:text-base text-brand-white/70 mb-8 max-w-md">
              Answer a few simple questions about your skin type, concerns, sensitivity and lifestyle. We&apos;ll guide you towards KENTELLE products and active ingredients selected to support your individual skincare needs.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="font-body text-xs uppercase tracking-widest text-brand-white/70 border border-brand-white/30 rounded-full px-4 py-2">
                3-Minute Quiz
              </span>
              <span className="font-body text-xs uppercase tracking-widest text-brand-white/70 border border-brand-white/30 rounded-full px-4 py-2">
                Personalised Skin Guidance
              </span>
              <span className="font-body text-xs uppercase tracking-widest text-brand-white/70 border border-brand-white/30 rounded-full px-4 py-2">
                100% Free
              </span>
            </div>
            <Link
              href="/skin-quiz/quiz"
              className="inline-flex items-center justify-center px-10 py-4 bg-brand-accent text-brand-navy font-heading font-bold text-sm uppercase tracking-widest rounded hover:bg-brand-accent/85 transition-colors"
            >
              Discover My Skin Routine
            </Link>
          </div>
        </section>

        {/* Trust line */}
        <section aria-label="Credentials" className="py-10 border-b border-brand-contrast/10">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="font-body text-sm text-brand-contrast">
              Science-backed skincare crafted for Australian skin — developed in partnership with{" "}
              <strong className="text-brand-navy">Beaubelle Beauty Clinic, Perth WA</strong>. Cruelty-free, always.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section aria-label="How it works" className="py-20 px-6">
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={reveal}
            className="text-center font-heading text-xs font-bold tracking-[0.3em] uppercase text-brand-blue mb-10"
          >
            How It Works
          </motion.p>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                variants={reveal}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-heading font-bold text-3xl text-brand-navy mb-2">{s.stat}</div>
                <p className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy mb-2">{s.title}</p>
                <p className="font-body text-sm text-brand-contrast leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Product teaser */}
        <section aria-labelledby="qz-product-heading" className="py-20 px-6 bg-brand-pink">
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={reveal}
            className="text-center font-heading text-xs font-bold tracking-[0.3em] uppercase text-brand-accent mb-6"
          >
            Your Personalised Routine
          </motion.p>
          <motion.h2
            id="qz-product-heading"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={reveal}
            className="text-center font-heading font-bold text-2xl md:text-4xl text-brand-navy mb-4 max-w-2xl mx-auto"
          >
            Everything your skin needs. Nothing it doesn&apos;t.
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={reveal}
            className="text-center font-body text-sm text-brand-contrast max-w-md mx-auto mb-14"
          >
            A calibrated system — every step and active chosen for your skin specifically.
          </motion.p>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRODUCTS.map((p, i) => (
              <motion.div
                key={p.name}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                variants={reveal}
                transition={{ delay: i * 0.1 }}
                className="bg-brand-white rounded overflow-hidden"
              >
                <div className="relative h-56 w-full">
                  <Image src={p.img} alt={p.name} fill className="object-cover" />
                </div>
                <div className="p-5">
                  <p className="font-heading font-bold text-sm text-brand-navy">{p.name}</p>
                  <p className="font-body text-xs text-brand-contrast mt-1">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/skin-quiz/quiz"
              className="inline-flex items-center justify-center px-10 py-4 border-2 border-brand-navy text-brand-navy font-heading font-bold text-sm uppercase tracking-widest rounded hover:bg-brand-navy hover:text-brand-white transition-colors"
            >
              Discover My Skin Routine
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section aria-labelledby="qz-final-heading" className="py-24 px-6 text-center">
          <motion.h2
            id="qz-final-heading"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={reveal}
            className="font-heading font-bold text-2xl md:text-4xl text-brand-navy max-w-2xl mx-auto mb-8"
          >
            Your skin is waiting. <em className="not-italic text-brand-accent">3 minutes</em> is all it takes.
          </motion.h2>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal}>
            <Link
              href="/skin-quiz/quiz"
              className="inline-flex items-center justify-center px-10 py-4 bg-brand-accent text-brand-navy font-heading font-bold text-sm uppercase tracking-widest rounded hover:bg-brand-accent/85 transition-colors"
            >
              Discover My Skin Routine
            </Link>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
