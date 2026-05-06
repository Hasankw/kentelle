import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const rows = await db.content.findMany({ where: { key: "chatbot_enabled" } });
    const enabled = rows[0]?.value !== "false";
    return NextResponse.json({ enabled });
  } catch {
    return NextResponse.json({ enabled: true });
  }
}
