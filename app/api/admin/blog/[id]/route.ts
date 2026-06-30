import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await db.blog.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const {
    title, slug, excerpt, body: postBody, coverImage,
    status, postType, published, publishedAt,
    seoTitle, seoDescription, focusKeyword,
    tags, categories,
    authorName, authorAvatarUrl, authorBio,
    isFeatured, readingTime,
  } = body;

  const existing = await db.blog.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build revision snapshot before overwriting
  const newRevision = {
    timestamp: new Date().toISOString(),
    title: existing.title,
    excerpt: existing.excerpt ?? "",
    body: existing.body,
  };
  const currentRevisions: unknown[] = Array.isArray(existing.revisions) ? existing.revisions : [];
  const revisions = [newRevision, ...currentRevisions].slice(0, 10);

  const resolvedStatus = status ?? (published ? "published" : "draft");
  const wasPublished = existing.published;
  const isNowPublished = resolvedStatus === "published";

  const post = await db.blog.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      slug: slug ?? existing.slug,
      excerpt: excerpt !== undefined ? (excerpt || null) : existing.excerpt,
      body: postBody !== undefined ? postBody : existing.body,
      coverImage: coverImage !== undefined ? (coverImage || null) : existing.coverImage,
      published: isNowPublished,
      publishedAt: isNowPublished && !wasPublished
        ? (publishedAt ? new Date(publishedAt) : new Date())
        : (publishedAt !== undefined ? (publishedAt ? new Date(publishedAt) : null) : existing.publishedAt),
      status: resolvedStatus,
      postType: postType ?? existing.postType,
      seoTitle: seoTitle !== undefined ? (seoTitle || null) : existing.seoTitle,
      seoDescription: seoDescription !== undefined ? (seoDescription || null) : existing.seoDescription,
      focusKeyword: focusKeyword !== undefined ? (focusKeyword || null) : existing.focusKeyword,
      tags: tags !== undefined ? tags : existing.tags,
      categories: categories !== undefined ? categories : existing.categories,
      authorName: authorName !== undefined ? (authorName || null) : existing.authorName,
      authorAvatarUrl: authorAvatarUrl !== undefined ? (authorAvatarUrl || null) : existing.authorAvatarUrl,
      authorBio: authorBio !== undefined ? (authorBio || null) : existing.authorBio,
      isFeatured: isFeatured !== undefined ? !!isFeatured : existing.isFeatured,
      readingTime: readingTime !== undefined ? readingTime : existing.readingTime,
      revisions,
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);

  if (searchParams.get("permanent") === "true") {
    await db.blog.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  // Soft delete — move to trash
  await db.blog.update({ where: { id }, data: { status: "trashed", published: false } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await db.blog.update({ where: { id }, data: { status: "draft", published: false } });
  return NextResponse.json(post);
}
