import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const routines = await db.routine.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(routines);
}

export async function POST(request: NextRequest) {
  const { title, slug, tagline, category, steps, tips, sortOrder, published } = await request.json();
  const routine = await db.routine.create({
    data: {
      title,
      slug,
      tagline: tagline || null,
      category,
      steps: steps ?? [],
      tips: tips ?? null,
      sortOrder: sortOrder ?? 0,
      published: published !== false,
    },
  });
  return NextResponse.json(routine, { status: 201 });
}
