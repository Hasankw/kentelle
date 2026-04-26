export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blog.findUnique({ where: { slug } });
  return {
    title: post?.title ?? "Blog",
    description: post?.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await db.blog.findUnique({ where: { slug, published: true } });

  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-navy transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        All Posts
      </Link>

      {post.publishedAt && (
        <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-blue mb-3">
          {new Date(post.publishedAt).toLocaleDateString("en-AU", { dateStyle: "long" })}
        </p>
      )}

      <h1 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy leading-tight mb-6">
        {post.title}
      </h1>

      {post.coverImage && (
        <div className="relative aspect-[16/9] mb-8 overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      <div
        className="prose prose-sm max-w-none font-body text-brand-navy/80 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.body.replace(/\n/g, "<br />") }}
      />
    </div>
  );
}
