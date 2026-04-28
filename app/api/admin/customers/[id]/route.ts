import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, email, phone } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const customer = await db.customer.update({
    where: { id },
    data: { name, email, phone: phone || null },
  });

  return NextResponse.json({ ok: true, customer });
}
