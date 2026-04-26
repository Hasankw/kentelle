import type { Metadata } from "next";
import { Questrial, Archivo } from "next/font/google";
import "./globals.css";
import StoreLayout from "@/components/store/StoreLayout";

const questrial = Questrial({
  weight: "400",
  variable: "--font-questrial",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  weight: "700",
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kentelle Skincare",
    template: "%s | Kentelle Skincare",
  },
  description:
    "Professional-grade skincare that feels indulgent, performs exceptionally, and empowers confidence in your natural beauty.",
  keywords: [
    "skincare",
    "beauty",
    "serum",
    "cleanser",
    "moisturiser",
    "kentelle",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${questrial.variable} ${archivo.variable}`}>
      <body className="min-h-screen flex flex-col">
        <StoreLayout>{children}</StoreLayout>
      </body>
    </html>
  );
}
