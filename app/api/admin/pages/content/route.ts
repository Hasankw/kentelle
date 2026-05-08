import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  const rows = await db.content.findMany({ where: { key } });
  return NextResponse.json({ value: rows[0]?.value ?? null });
}

export async function PUT(request: NextRequest) {
  const { key, value } = await request.json();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  await db.content.upsert({ where: { key }, create: { key, value, type: "json" }, update: { value } });
  return NextResponse.json({ ok: true });
}
