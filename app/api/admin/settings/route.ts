import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
