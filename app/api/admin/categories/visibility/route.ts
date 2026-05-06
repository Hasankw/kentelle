import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const CONTENT_KEY = "collections:hidden";

export async function GET() {
  const [content] = await db.content.findMany({ where: { key: CONTENT_KEY } });
  const hidden: string[] = content ? JSON.parse(content.value) : [];
  return NextResponse.json({ hidden });
}

export async function POST(req: NextRequest) {
  const { slug, visible } = await req.json();

  const [content] = await db.content.findMany({ where: { key: CONTENT_KEY } });
  const hidden: string[] = content ? JSON.parse(content.value) : [];

  const updated = visible
    ? hidden.filter((s) => s !== slug)
    : hidden.includes(slug) ? hidden : [...hidden, slug];

  await db.content.upsert({
    where: { key: CONTENT_KEY },
    create: { key: CONTENT_KEY, value: JSON.stringify(updated), type: "json" },
    update: { value: JSON.stringify(updated) },
  });

  return NextResponse.json({ ok: true, hidden: updated });
}
