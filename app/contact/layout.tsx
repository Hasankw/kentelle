import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Kentelle Skincare Perth WA",
  description: "Get in touch with Kentelle Skincare. Call or visit Beaubelle Beauty Clinic in Perth WA for a free skincare consultation. Email: info@kentelle.com | (08) 9228 0191.",
  robots: { index: true, follow: true },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
