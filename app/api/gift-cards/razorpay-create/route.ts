import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const { amount } = await req.json();
  if (!amount || amount < 1) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  const rzOrder = await createRazorpayOrder(Number(amount));
  return NextResponse.json({
    rzOrderId: rzOrder.id,
    amount: rzOrder.amount,
    currency: rzOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}
