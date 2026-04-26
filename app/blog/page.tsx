export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Blog",
  description: "Skincare tips, ingredient deep-dives, and expert advice from Kentelle.",
};

export default async function BlogPage() {
  const posts = await db.blog.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <section className="bg-brand-navy text-brand-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
            Kentelle Journal
          </p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl">
            Skin Smarter
          </h1>
          <p className="font-body text-brand-white/70 text-sm mt-3 max-w-lg mx-auto">
            Science-backed skincare education, ingredient guides, and routine advice.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        {posts.length === 0 ? (
          <p className="text-center font-body text-brand-contrast py-20">
            No posts yet — check back soon.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col border border-brand-contrast/10 bg-white hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[16/9] bg-brand-contrast/10 overflow-hidden">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/20 to-brand-blue/20" />
                  )}
                </div>
                <div className="flex flex-col flex-1 p-5">
                  {post.publishedAt && (
                    <p className="text-xs font-heading uppercase tracking-widest text-brand-blue mb-2">
                      {new Date(post.publishedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                  <h2 className="font-heading font-bold text-base text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="font-body text-sm text-brand-contrast leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="mt-4 text-xs font-heading font-bold uppercase tracking-widest text-brand-blue border-b border-brand-blue pb-0.5 self-start">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
