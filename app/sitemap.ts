import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const base = "https://kentelle.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/find-your-routine`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/reviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  let collectionPages: MetadataRoute.Sitemap = [];
  let productPages: MetadataRoute.Sitemap = [];
  let blogPages: MetadataRoute.Sitemap = [];

  try {
    const [categories, products, posts] = await Promise.all([
      db.category.findMany({}),
      db.product.findMany({ where: { isActive: true } }),
      db.blog.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }),
    ]);

    collectionPages = categories.map((c: any) => ({
      url: `${base}/collections/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    productPages = products.map((p: any) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt ?? p.createdAt ?? new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    blogPages = posts.map((p: any) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt ?? p.createdAt ?? new Date()),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // silently skip dynamic pages if DB unreachable
  }

  return [...staticPages, ...collectionPages, ...productPages, ...blogPages];
}
