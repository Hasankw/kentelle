import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const rows = await db.content.findMany({ where: { key: { in: ["announcement_text", "announcement_enabled"] } as any } });
  const map = Object.fromEntries((rows as any[]).map((r: any) => [r.key, r.value]));
  return NextResponse.json({
    announcement_text: map["announcement_text"] ?? "",
    announcement_enabled: map["announcement_enabled"] === "true",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      db.content.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
