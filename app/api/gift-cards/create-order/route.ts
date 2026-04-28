import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  const { amount } = await req.json();
  if (!amount || amount < 1) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  const total = parseFloat(Number(amount).toFixed(2));
  const paypalOrderId = await createPayPalOrder(total, "AUD");
  return NextResponse.json({ paypalOrderId });
}
