import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Your Skincare Routine | Kentelle Skincare",
  description: "Take our free skin quiz to discover your personalised Kentelle skincare routine. Tailored recommendations for Australian skin types — dry, oily, sensitive, combination and more.",
  robots: { index: true, follow: true },
};

export default function FindYourRoutineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
