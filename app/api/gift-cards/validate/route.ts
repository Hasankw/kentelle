import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const gc = await db.giftCard.findUnique({ where: { code: code.toUpperCase().trim() } });

  if (!gc) return NextResponse.json({ error: "Invalid gift card code" }, { status: 404 });
  if (gc.status !== "ACTIVE") {
    return NextResponse.json({ error: "This gift card has already been redeemed" }, { status: 400 });
  }

  return NextResponse.json({ code: gc.code, amount: gc.amount });
}
