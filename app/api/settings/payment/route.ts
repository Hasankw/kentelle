import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const rows = await db.content.findMany({
    where: {
      key: {
        in: [
          "razorpay_enabled",
          "paypal_enabled",
          "razorpay_key_id",
          "paypal_client_id",
        ],
      },
    },
  });
  const s = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));

  const razorpayEnabled = (s.razorpay_enabled ?? "true") === "true";
  const paypalEnabled = (s.paypal_enabled ?? "false") === "true";
  const razorpayKeyId = s.razorpay_key_id ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  const paypalClientId = s.paypal_client_id ?? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  return NextResponse.json({ razorpayEnabled, paypalEnabled, razorpayKeyId, paypalClientId });
}
