import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://kentelle.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/collections/",
          "/about",
          "/contact",
          "/find-your-routine",
          "/products/",
          "/blog",
          "/blog/",
          "/faq",
          "/reviews",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/account",
          "/account/",
          "/cart",
          "/checkout",
          "/gift-cards",
          "/order-confirmation",
          "/login",
          "/signup",
          "/privacy",
          "/terms",
          "/skin-regimen",
          "/skin-quiz",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
