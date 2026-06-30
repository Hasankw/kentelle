import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("list") !== "true") return NextResponse.json({ error: "Not found" }, { status: 404 });

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const perPage = parseInt(searchParams.get("perPage") ?? "20", 10);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const [posts, total, allCount, publishedCount, draftCount, trashedCount] = await Promise.all([
    db.blog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: { id: true, title: true, slug: true, status: true, postType: true, authorName: true, publishedAt: true, isFeatured: true, readingTime: true },
    }),
    db.blog.count({ where }),
    db.blog.count(),
    db.blog.count({ where: { status: "published" } }),
    db.blog.count({ where: { status: "draft" } }),
    db.blog.count({ where: { status: "trashed" } }),
  ]);

  return NextResponse.json({ posts, total, counts: { all: allCount, published: publishedCount, draft: draftCount, trashed: trashedCount } });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    title, slug, excerpt, body: postBody, coverImage,
    status = "draft", postType = "blog",
    seoTitle, seoDescription, focusKeyword,
    tags = [], categories = [],
    authorName, authorAvatarUrl, authorBio,
    isFeatured = false, publishedAt,
  } = body;

  const wordCount = (postBody ?? "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  let post;
  try {
    post = await db.blog.create({
      data: {
        title, slug,
        excerpt: excerpt || null,
        body: postBody ?? "",
        coverImage: coverImage || null,
        published: status === "published",
        publishedAt: status === "published" ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
        status, postType,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        focusKeyword: focusKeyword || null,
        tags: tags ?? [],
        categories: categories ?? [],
        authorName: authorName || null,
        authorAvatarUrl: authorAvatarUrl || null,
        authorBio: authorBio || null,
        isFeatured: !!isFeatured,
        readingTime,
        revisions: [],
      },
    });
  } catch {
    // Fallback: DB migration not yet applied — create with original fields only
    post = await db.blog.create({
      data: {
        title, slug,
        excerpt: excerpt || null,
        body: postBody ?? "",
        coverImage: coverImage || null,
        published: false,
        publishedAt: null,
      },
    });
  }

  return NextResponse.json(post, { status: 201 });
}
