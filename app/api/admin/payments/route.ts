import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // body contains any payment settings key-value pairs
  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      db.content.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    )
  );
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const rows = await db.content.findMany({
    where: {
      key: {
        in: [
          "payment_portal",
          "razorpay_key_id",
          "razorpay_key_secret",
          "paypal_client_id",
          "paypal_secret",
        ],
      },
    },
  });
  const settings = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
  return NextResponse.json(settings);
}
