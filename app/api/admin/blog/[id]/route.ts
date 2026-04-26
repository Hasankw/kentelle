import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { title, slug, excerpt, body, coverImage, published } = await request.json();

  const existing = await db.blog.findUnique({ where: { id } });
  const wasPublished = existing?.published;

  const post = await db.blog.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      body,
      coverImage: coverImage || null,
      published: !!published,
      publishedAt: published && !wasPublished ? new Date() : undefined,
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.blog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
