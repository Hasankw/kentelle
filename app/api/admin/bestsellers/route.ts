import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const CONTENT_KEY = "bestsellers";

export async function GET() {
  const rows = await db.content.findMany({ where: { key: CONTENT_KEY } });
  const ids: string[] = rows[0] ? JSON.parse(rows[0].value) : [];
  return NextResponse.json({ ids });
}

export async function POST(req: NextRequest) {
  const { ids } = await req.json();
  if (!Array.isArray(ids)) return NextResponse.json({ error: "ids must be array" }, { status: 400 });

  const value = JSON.stringify(ids);
  await db.content.upsert({
    where: { key: CONTENT_KEY },
    update: { value },
    create: { key: CONTENT_KEY, value },
  });

  return NextResponse.json({ success: true });
}
