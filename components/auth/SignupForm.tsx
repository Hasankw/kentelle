"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/account";

  // Step 1 fields
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  // Step 2 state
  const [step, setStep] = useState<"details" | "verify">("details");
  const [token, setToken] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
  );

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  // ── Step 1: send OTP ──────────────────────────────────────────────────────
  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send code"); return; }
      setToken(data.token);
      setStep("verify");
    });
  };

  // ── Step 2: verify OTP + create account ──────────────────────────────────
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = digits.join("");
    if (code.length !== 6) { setError("Please enter all 6 digits"); return; }
    startTransition(async () => {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, code, name: form.name, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Verification failed"); return; }

      // Account created — sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (signInError) { setError("Account created! Please sign in."); return; }

      router.push(redirectTo);
      router.refresh();
    });
  };

  // ── Resend code ───────────────────────────────────────────────────────────
  const handleResend = () => {
    setError("");
    setDigits(["", "", "", "", "", ""]);
    startTransition(async () => {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to resend code"); return; }
      setToken(data.token);
      inputRefs.current[0]?.focus();
    });
  };

  // ── OTP digit input handler ───────────────────────────────────────────────
  const handleDigit = (i: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    if (char && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleDigitKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...digits];
    pasted.split("").forEach((c, idx) => { if (idx < 6) next[idx] = c; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const fieldClass =
    "w-full border border-brand-contrast/20 px-4 py-3 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  // ── Render: Step 1 ────────────────────────────────────────────────────────
  if (step === "details") {
    return (
      <form onSubmit={handleSendOTP} className="space-y-4">
        <div>
          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">Full Name</label>
          <input
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">Password</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className={fieldClass}
          />
        </div>

        {error && <p className="text-xs text-red-600 font-body">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-brand-navy text-brand-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
        >
          {isPending ? "Sending code..." : "Continue"}
        </button>

        <p className="text-center text-sm font-body text-brand-contrast">
          Already have an account?{" "}
          <Link
            href={redirectTo !== "/account" ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
            className="text-brand-blue hover:underline font-bold"
          >
            Sign in
          </Link>
        </p>
      </form>
    );
  }

  // ── Render: Step 2 ────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleVerify} className="space-y-6">
      <div className="text-center">
        <div className="text-3xl mb-3">📧</div>
        <p className="font-body text-sm text-brand-contrast leading-relaxed">
          We sent a 6-digit code to<br />
          <strong className="text-brand-navy">{form.email}</strong>
        </p>
        <button
          type="button"
          onClick={() => { setStep("details"); setError(""); }}
          className="text-xs text-brand-blue hover:underline mt-1 font-body"
        >
          Wrong email? Go back
        </button>
      </div>

      {/* 6-digit input boxes */}
      <div className="flex justify-center gap-2.5" onPaste={handleDigitPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleDigit(i, e.target.value)}
            onKeyDown={(e) => handleDigitKeyDown(i, e)}
            className="w-11 h-14 text-center text-xl font-heading font-bold text-brand-navy border-2 border-brand-contrast/20 focus:border-brand-blue focus:outline-none rounded transition-colors bg-white"
          />
        ))}
      </div>

      {error && <p className="text-xs text-red-600 font-body text-center">{error}</p>}

      <button
        type="submit"
        disabled={isPending || digits.join("").length !== 6}
        className="w-full py-3 bg-brand-navy text-brand-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
      >
        {isPending ? "Verifying..." : "Verify & Create Account"}
      </button>

      <p className="text-center text-sm font-body text-brand-contrast">
        Didn&apos;t receive it?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending}
          className="text-brand-blue hover:underline font-bold disabled:opacity-50"
        >
          Resend code
        </button>
      </p>
    </form>
  );
}
