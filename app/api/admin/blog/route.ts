import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { title, slug, excerpt, body, coverImage, published } = await request.json();

  const post = await db.blog.create({
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      body,
      coverImage: coverImage || null,
      published: !!published,
      publishedAt: published ? new Date() : null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
