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
    default: "Kentelle Skincare — Science-Backed Australian Skincare",
    template: "%s | Kentelle Skincare",
  },
  description:
    "Professional-grade, cruelty-free skincare crafted for Australian skin. Shop cleansers, serums, moisturisers and more from Kentelle Skincare, Perth WA.",
  keywords: ["kentelle", "skincare", "australian skincare", "professional skincare", "serum", "cleanser", "moisturiser", "perth skincare"],
  authors: [{ name: "Kentelle Skincare" }],
  creator: "Kentelle Skincare",
  metadataBase: new URL("https://kentelle.com"),
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://kentelle.com",
    siteName: "Kentelle Skincare",
    title: "Kentelle Skincare — Science-Backed Australian Skincare",
    description: "Professional-grade, cruelty-free skincare crafted for Australian skin. Shop cleansers, serums, moisturisers and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
