import { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Kentelle account.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
            My Account
          </p>
          <h1 className="font-heading font-bold text-3xl text-brand-navy">
            Welcome Back
          </h1>
          <p className="font-body text-sm text-brand-contrast mt-2">
            Sign in to track orders and manage your account.
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
