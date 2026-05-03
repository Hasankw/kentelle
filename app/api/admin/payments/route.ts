import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const KEYS = [
  "razorpay_enabled",
  "paypal_enabled",
  "razorpay_key_id",
  "razorpay_key_secret",
  "paypal_client_id",
  "paypal_secret",
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  await Promise.all(
    Object.entries(body)
      .filter(([key]) => KEYS.includes(key))
      .map(([key, value]) =>
        db.content.upsert({
          where: { key },
          create: { id: crypto.randomUUID(), key, value: String(value), updatedAt: new Date().toISOString() },
          update: { value: String(value) },
        })
      )
  );
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const rows = await db.content.findMany({ where: { key: { in: KEYS } } });
  const s = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
  return NextResponse.json({
    razorpay_enabled: s.razorpay_enabled ?? "true",
    paypal_enabled: s.paypal_enabled ?? "false",
    razorpay_key_id: s.razorpay_key_id ?? "",
    razorpay_key_secret: s.razorpay_key_secret ?? "",
    paypal_client_id: s.paypal_client_id ?? "",
    paypal_secret: s.paypal_secret ?? "",
  });
}
