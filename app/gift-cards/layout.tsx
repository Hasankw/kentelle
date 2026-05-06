import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Cards | Kentelle Skincare",
  robots: { index: false, follow: false },
};

export default function GiftCardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
