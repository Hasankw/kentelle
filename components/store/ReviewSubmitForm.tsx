"use client";

import { useState, useTransition } from "react";

export default function ReviewSubmitForm() {
  const [form, setForm] = useState({ name: "", rating: 5, body: "", productName: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const set = (key: string, val: string | number) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 px-4 py-5 text-sm font-body text-green-800">
        Thank you! Your review has been submitted for approval.
      </div>
    );
  }

  const fieldClass =
    "w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Your Name *
        </label>
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Product (optional)
        </label>
        <input
          value={form.productName}
          onChange={(e) => set("productName", e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Rating *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => set("rating", star)}
              className={`text-xl ${star <= form.rating ? "text-brand-blue" : "text-brand-contrast/30"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Review *
        </label>
        <textarea
          required
          rows={4}
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          className={`${fieldClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-brand-navy text-brand-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
