import { Metadata } from "next";
import { Suspense } from "react";
import ProRegisterForm from "@/components/auth/ProRegisterForm";

export const metadata: Metadata = {
  title: "Professional Access Application | Kentelle",
  description: "Apply for professional access to the KENTELLE Clinical Range. For qualified dermal therapists, aestheticians, and beauty therapy practitioners.",
  robots: { index: false, follow: false },
};

export default function ProRegisterPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
            Restricted Access
          </p>
          <h1 className="font-heading font-bold text-3xl text-brand-navy mb-3">
            Professional Access Application
          </h1>
          <p className="font-body text-sm text-brand-contrast leading-relaxed max-w-md mx-auto">
            The KENTELLE Professional &amp; Clinical Range is available exclusively to verified practitioners. Complete this form to apply — your credentials will be reviewed and access granted within 1–2 business days.
          </p>
        </div>

        <div className="border-t border-brand-contrast/10 pt-8">
          <Suspense fallback={null}>
            <ProRegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
