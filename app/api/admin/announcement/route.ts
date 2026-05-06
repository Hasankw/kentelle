import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const items = await db.content.findMany({ where: { key: { in: ["checkout:announcement:text", "checkout:announcement:enabled"] } as any } });
  const map = Object.fromEntries((items as any[]).map((i: any) => [i.key, i.value]));
  return NextResponse.json({
    text: map["checkout:announcement:text"] ?? "",
    enabled: map["checkout:announcement:enabled"] === "true",
  });
}

export async function POST(req: NextRequest) {
  const { text, enabled } = await req.json();

  await Promise.all([
    db.content.upsert({
      where: { key: "checkout:announcement:text" },
      create: { key: "checkout:announcement:text", value: String(text ?? ""), type: "text" },
      update: { value: String(text ?? "") },
    }),
    db.content.upsert({
      where: { key: "checkout:announcement:enabled" },
      create: { key: "checkout:announcement:enabled", value: String(enabled), type: "text" },
      update: { value: String(enabled) },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
