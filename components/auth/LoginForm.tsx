"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    });
  };

  const fieldClass =
    "w-full border border-brand-contrast/20 px-4 py-3 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Email
        </label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 font-body">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-brand-navy text-brand-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm font-body text-brand-contrast">
        Don&apos;t have an account?{" "}
        <Link
          href={redirectTo !== "/account" ? `/signup?redirect=${encodeURIComponent(redirectTo)}` : "/signup"}
          className="text-brand-blue hover:underline font-bold"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
