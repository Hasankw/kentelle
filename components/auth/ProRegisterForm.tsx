"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";

const QUALIFICATION_TYPES = [
  "Dermal Therapist",
  "Aesthetic Nurse",
  "Beauty Therapist",
  "Cosmetic Physician",
  "Dermatologist",
  "Esthetician",
  "Other Qualified Practitioner",
];

const fieldClass =
  "w-full border border-brand-contrast/20 px-4 py-3 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

export default function ProRegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    qualificationType: "",
    trainingAck: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: string, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please upload your qualification certificate.");
      return;
    }
    if (!form.trainingAck) {
      setError("Please acknowledge the product training requirement.");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("qualificationType", form.qualificationType);
      fd.append("trainingAck", String(form.trainingAck));
      fd.append("certificate", file);

      const res = await fetch("/api/auth/pro-register", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl">✅</div>
        <h2 className="font-heading font-bold text-2xl text-brand-navy">
          Application Submitted
        </h2>
        <p className="font-body text-sm text-brand-contrast leading-relaxed max-w-sm mx-auto">
          Thank you for applying for professional access. We&apos;ll review your qualifications and notify you by email once your account is approved.
        </p>
        <p className="font-body text-xs text-brand-contrast/70">
          This usually takes 1–2 business days.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 text-xs font-heading font-bold uppercase tracking-widest text-brand-blue hover:underline"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Full Name
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Password
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Professional Qualification Type
        </label>
        <select
          required
          value={form.qualificationType}
          onChange={(e) => set("qualificationType", e.target.value)}
          className={fieldClass}
        >
          <option value="">Select your qualification…</option>
          {QUALIFICATION_TYPES.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Qualification Certificate <span className="text-red-500">*</span>
        </label>
        <div
          className="border border-dashed border-brand-contrast/30 p-4 text-center cursor-pointer hover:border-brand-blue transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="font-body text-sm text-brand-navy">{file.name}</p>
          ) : (
            <>
              <p className="font-body text-sm text-brand-contrast">
                Click to upload your certificate
              </p>
              <p className="font-body text-xs text-brand-contrast/60 mt-1">
                PDF, JPG, or PNG — max 10MB
              </p>
            </>
          )}
        </div>
      </div>

      <div className="border border-brand-accent/30 bg-brand-accent/5 rounded p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.trainingAck}
            onChange={(e) => set("trainingAck", e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-brand-navy shrink-0"
          />
          <span className="font-body text-sm text-brand-navy leading-relaxed">
            I acknowledge that I am required to complete the <strong>KENTELLE Product Training</strong> offered by Ken Ken before purchasing from the Professional &amp; Clinical Range. I understand that access will only be granted after both qualification verification and training completion are confirmed.
          </span>
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-600 font-body">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-brand-navy text-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
      >
        {isPending ? "Submitting Application…" : "Submit Pro Application"}
      </button>

      <p className="text-center text-sm font-body text-brand-contrast">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-blue hover:underline font-bold">
          Sign in
        </Link>
      </p>
    </form>
  );
}
