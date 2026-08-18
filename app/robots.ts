import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://kentelle.com";
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
          "/skin-quiz",
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
          "/buy/",
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
