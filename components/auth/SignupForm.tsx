"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        await fetch("/api/account/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, supabaseUid: data.user.id }),
        });
      }

      router.push("/account");
      router.refresh();
    });
  };

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const fieldClass =
    "w-full border border-brand-contrast/20 px-4 py-3 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Full Name
        </label>
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
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Email
        </label>
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
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Password
        </label>
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

      {error && (
        <p className="text-xs text-red-600 font-body">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-brand-navy text-brand-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
      >
        {isPending ? "Creating account..." : "Create Account"}
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
