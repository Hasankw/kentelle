"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin } from "lucide-react";
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

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
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
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-3">
          Get In Touch
        </p>
        <h1 className="font-heading font-bold text-4xl text-brand-navy">
          Contact Us
        </h1>
        <p className="font-body text-brand-contrast text-sm mt-3">
          We&apos;d love to hear from you. Our team responds within 24 hours.
        </p>
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
        </form>

        {/* Info */}
        <div className="space-y-8">
          <div>
            <h2 className="font-heading font-bold text-lg text-brand-navy mb-4 uppercase tracking-wider">
              Our Details
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-brand-blue shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-navy">
                    Email
                  </p>
                  <a
                    href="mailto:hello@kentelle.com.au"
                    className="text-sm font-body text-brand-contrast hover:text-brand-navy transition-colors"
                  >
                    hello@kentelle.com.au
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-brand-blue shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-navy">
                    Phone
                  </p>
                  <a
                    href="tel:+61299999999"
                    className="text-sm font-body text-brand-contrast hover:text-brand-navy transition-colors"
                  >
                    +61 2 9999 9999
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-brand-blue shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-navy">
                    Location
                  </p>
                  <p className="text-sm font-body text-brand-contrast">
                    Sydney, NSW, Australia
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="border-t border-brand-contrast/20 pt-8">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy mb-3">
              Business Hours
            </h3>
            <ul className="space-y-1.5 font-body text-sm text-brand-contrast">
              <li className="flex justify-between">
                <span>Monday – Friday</span>
                <span>9:00am – 5:00pm AEST</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span>10:00am – 2:00pm AEST</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span>Closed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
