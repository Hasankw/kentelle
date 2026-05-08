"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, ExternalLink, MessageCircle, CalendarDays } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

interface ContactInfo { email: string; phone: string; address: string; hours: string; mapLink: string; }

const DEFAULT_INFO: ContactInfo = {
  email: "hello@kentelle.com.au",
  phone: "(08) 9228 0191",
  address: "Perth, WA, Australia",
  hours: "Monday – Friday: 9:00am – 5:00pm AWST\nSaturday: 10:00am – 2:00pm AWST\nSunday: Closed",
  mapLink: "",
};

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<ContactInfo>(DEFAULT_INFO);

  useEffect(() => {
    fetch("/api/admin/pages/content?key=page_contact")
      .then((r) => r.json())
      .then((d) => { if (d.value) setInfo({ ...DEFAULT_INFO, ...JSON.parse(d.value) }); })
      .catch(() => {});
  }, []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast("success", "Message sent! We'll reply within 24 hours.");
      reset();
    } else {
      toast("error", "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-3">
            Get In Touch
          </p>
          <h1 className="font-heading font-bold text-4xl text-brand-navy">
            Contact Us
          </h1>
          <p className="font-body text-brand-contrast text-sm mt-3 max-w-md mx-auto">
            We&apos;d love to hear from you. Our team responds within 24 hours.
          </p>
        </div>

        {/* Consultation CTA banner */}
        <div
          className="mb-12 rounded p-6 flex flex-col sm:flex-row items-center gap-5"
          style={{ background: "linear-gradient(135deg, #3A3240 0%, #4A3F52 100%)" }}
        >
          <div className="flex-1">
            <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-blue mb-1">
              Free Consultation Available
            </p>
            <h2 className="font-heading font-bold text-xl text-white mb-1">
              Speak with a Skin Expert
            </h2>
            <p className="text-sm font-body text-white/70">
              Visit our Beaubelle Beauty Clinic in Perth for a personalised, face-to-face skincare consultation — completely free.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="https://www.beaubelle.com.au"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-heading font-bold uppercase tracking-widest rounded transition-opacity hover:opacity-80"
              style={{ background: "#D4A5B5", color: "#3A3240" }}
            >
              <CalendarDays size={14} />
              Book Consultation
            </a>
            <a
              href="tel:0892280191"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-heading font-bold uppercase tracking-widest rounded border border-white/30 text-white transition-colors hover:bg-white/10"
            >
              <Phone size={14} />
              Call Clinic
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Name"
              id="name"
              {...register("name")}
              error={errors.name?.message}
            />
            <Input
              label="Email"
              id="email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              label="Phone (optional)"
              id="phone"
              type="tel"
              {...register("phone")}
            />
            <div className="flex flex-col gap-1">
              <label
                htmlFor="message"
                className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                {...register("message")}
                className="w-full border border-brand-contrast/30 bg-transparent px-4 py-3 text-sm text-brand-navy placeholder:text-brand-contrast/60 outline-none focus:border-brand-navy transition-colors resize-none"
                placeholder="Tell us how we can help..."
              />
              {errors.message && (
                <span className="text-xs text-red-500">{errors.message.message}</span>
              )}
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Send Message
            </Button>

            {/* Chat CTA below form */}
            <div className="text-center pt-2">
              <p className="text-xs font-body text-brand-contrast mb-2">Prefer to chat instantly?</p>
              <button
                type="button"
                onClick={() => {
                  const btn = document.querySelector<HTMLButtonElement>('[aria-label="Open chat"]');
                  btn?.click();
                }}
                className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-navy border border-brand-navy px-4 py-2 rounded hover:bg-brand-navy hover:text-white transition-colors"
              >
                <MessageCircle size={13} />
                Chat with Keni
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-heading font-bold text-lg text-brand-navy mb-4 uppercase tracking-wider">
                Our Details
              </h2>
              <ul className="space-y-5">
                {info.email && (
                  <li className="flex items-start gap-3">
                    <Mail size={18} className="text-brand-blue shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-navy">Email</p>
                      <a href={`mailto:${info.email}`} className="text-sm font-body text-brand-contrast hover:text-brand-navy transition-colors">{info.email}</a>
                    </div>
                  </li>
                )}
                {info.phone && (
                  <li className="flex items-start gap-3">
                    <Phone size={18} className="text-brand-blue shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-navy">Phone</p>
                      <a href={`tel:${info.phone.replace(/\D/g, "")}`} className="text-sm font-body text-brand-contrast hover:text-brand-navy transition-colors">{info.phone}</a>
                    </div>
                  </li>
                )}
                {info.address && (
                  <li className="flex items-start gap-3">
                    <MapPin size={18} className="text-brand-blue shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-navy">Location</p>
                      <p className="text-sm font-body text-brand-contrast whitespace-pre-line">{info.address}</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Beaubelle clinic card */}
            <div className="rounded border border-brand-contrast/20 p-5" style={{ background: "#F5EEF3" }}>
              <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy mb-1">
                Our Partner Clinic
              </p>
              <h3 className="font-heading font-bold text-base text-brand-navy mb-2">
                Beaubelle Beauty Clinic
              </h3>
              <p className="text-sm font-body text-brand-contrast mb-4">
                Call Beaubelle or visit their website to book a free in-person skin consultation with a qualified aesthetician.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:0892280191"
                  className="flex items-center gap-1.5 text-xs font-heading font-bold text-brand-navy hover:text-brand-blue transition-colors"
                >
                  <Phone size={12} /> (08) 9228 0191
                </a>
                <a
                  href="https://www.beaubelle.com.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-heading font-bold text-brand-navy hover:text-brand-blue transition-colors"
                >
                  <ExternalLink size={12} /> beaubelle.com.au
                </a>
              </div>
            </div>

            {info.hours && (
              <div className="border-t border-brand-contrast/20 pt-6">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy mb-3">
                  Business Hours
                </h3>
                <p className="font-body text-sm text-brand-contrast whitespace-pre-line">{info.hours}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="w-full" style={{ borderTop: "1px solid #E8D8E8" }}>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-blue mb-2">
            Find Us
          </p>
          <h2 className="font-heading font-bold text-2xl text-brand-navy mb-6">
            Visit Beaubelle Beauty Clinic
          </h2>
        </div>
        <div className="w-full h-80 md:h-[420px]">
          <iframe
            title="Beaubelle Beauty Clinic Perth"
            src={info.mapLink || "https://maps.google.com/maps?q=Beaubelle+Beauty+Clinic+Perth+WA+Australia&t=&z=15&ie=UTF8&iwloc=&output=embed"}
            width="100%"
            height="100%"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
