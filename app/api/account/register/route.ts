import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAdminNewUserAlert } from "@/lib/resend";

export async function POST(request: NextRequest) {
  const { name, email, supabaseUid } = await request.json();

  await db.customer.upsert({
    where: { email },
    create: { name, email, supabaseUid },
    update: { supabaseUid },
  });

  try {
    await sendAdminNewUserAlert(name, email);
  } catch { /* non-fatal */ }

  return NextResponse.json({ ok: true });
}
