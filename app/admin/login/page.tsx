"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error ?? "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy px-4">
      <div className="w-full max-w-sm bg-brand-bg p-8 shadow-2xl">
        <h1 className="font-heading font-bold text-xl uppercase tracking-widest text-brand-navy text-center mb-1">
          Kentelle
        </h1>
        <p className="text-xs text-brand-contrast text-center mb-8 font-body">
          Admin Dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="text-xs text-red-500 font-body">{error}</p>
          )}
          <Button className="w-full" loading={loading} type="submit">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
