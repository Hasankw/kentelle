import { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Kentelle account.",
};

export default function SignupPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
            Join Kentelle
          </p>
          <h1 className="font-heading font-bold text-3xl text-brand-navy">
            Create Account
          </h1>
          <p className="font-body text-sm text-brand-contrast mt-2">
            Create an account to track orders and save your details.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
