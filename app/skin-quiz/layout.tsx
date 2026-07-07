import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skin Quiz — Find Your Routine | Kentelle Skincare",
  description: "Take our free 60-second skin quiz and get matched to a clinically-designed Kentelle skincare routine — tailored for oily, dry, sensitive and acne-prone skin.",
  robots: { index: true, follow: true },
};

export default function SkinQuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
