import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const rows = await db.content.findMany({ where: { key: "events_section_title" } });
  return NextResponse.json({ title: rows[0]?.value ?? "Our Special Offers" });
}

export async function POST(req: NextRequest) {
  const { title } = await req.json();
  await db.content.upsert({
    where: { key: "events_section_title" },
    update: { value: title },
    create: { key: "events_section_title", value: title },
  });
  return NextResponse.json({ ok: true });
}
