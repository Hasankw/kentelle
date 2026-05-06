import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { sessionId, email } = await req.json();
  if (!sessionId || !email) {
    return NextResponse.json({ error: "Missing sessionId or email" }, { status: 400 });
  }
  await db.chatSession.upsert(sessionId, email);
  return NextResponse.json({ ok: true });
}
