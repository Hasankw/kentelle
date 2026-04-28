import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const rows = await db.content.findMany({
    where: {
      key: { in: ["payment_portal", "razorpay_key_id", "paypal_client_id"] },
    },
  });
  const s = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));

  // fall back to env vars if not set in DB
  const portal = s.payment_portal ?? "razorpay";
  const razorpayKeyId = s.razorpay_key_id ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  const paypalClientId = s.paypal_client_id ?? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  return NextResponse.json({ portal, razorpayKeyId, paypalClientId });
}
