import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_PRO_STATUSES = ["retail", "pending", "approved"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, email, phone, proStatus } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const data: Record<string, unknown> = {
    name,
    email,
    phone: phone || null,
  };

  if (proStatus !== undefined) {
    if (!VALID_PRO_STATUSES.includes(proStatus)) {
      return NextResponse.json({ error: "Invalid pro status" }, { status: 400 });
    }
    data.proStatus = proStatus;
  }

  const customer = await db.customer.update({ where: { id }, data });

  return NextResponse.json({ ok: true, customer });
}
