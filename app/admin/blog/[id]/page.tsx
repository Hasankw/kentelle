export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import BlogEditorClient from "@/components/admin/BlogEditorClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

function toISOStringOrNull(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();

  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export default async function AdminBlogEditPage({ params }: PageProps) {
  const { id } = await params;
  const post = await db.blog.findUnique({ where: { id } });
  if (!post) notFound();

  const initialPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    body: post.body ?? "",
    coverImage: post.coverImage ?? "",
    status: (post as unknown as Record<string, string>).status ?? "draft",
    postType: (post as unknown as Record<string, string>).postType ?? "blog",
    seoTitle: (post as unknown as Record<string, string>).seoTitle ?? "",
    seoDescription: (post as unknown as Record<string, string>).seoDescription ?? "",
    focusKeyword: (post as unknown as Record<string, string>).focusKeyword ?? "",
    tags: (post as unknown as Record<string, string[]>).tags ?? [],
    categories: (post as unknown as Record<string, string[]>).categories ?? [],
    authorName: (post as unknown as Record<string, string>).authorName ?? "",
    authorAvatarUrl: (post as unknown as Record<string, string>).authorAvatarUrl ?? "",
    authorBio: (post as unknown as Record<string, string>).authorBio ?? "",
    readingTime: (post as unknown as Record<string, number | null>).readingTime ?? null,
    isFeatured: (post as unknown as Record<string, boolean>).isFeatured ?? false,
    publishedAt: toISOStringOrNull(post.publishedAt),
    revisions: (post as unknown as Record<string, unknown[]>).revisions ?? [],
  };

  return <BlogEditorClient initialPost={initialPost as Parameters<typeof BlogEditorClient>[0]["initialPost"]} />;
}
