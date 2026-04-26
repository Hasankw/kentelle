import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { name, email, supabaseUid } = await request.json();

  await db.customer.upsert({
    where: { email },
    create: { name, email, supabaseUid },
    update: { supabaseUid },
  });

  return NextResponse.json({ ok: true });
}
