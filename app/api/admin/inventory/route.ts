import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { updates } = await req.json();
  // updates: Array<{ id: string; stock: number }>
  if (!Array.isArray(updates)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  await Promise.all(
    updates.map((u: { id: string; stock: number }) =>
      db.product.update({ where: { id: u.id }, data: { stock: Number(u.stock) } })
    )
  );
  return NextResponse.json({ ok: true });
}
