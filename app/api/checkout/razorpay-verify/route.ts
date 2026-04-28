import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendOrderConfirmation } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { rzOrderId, paymentId, signature } = await req.json();

  if (!rzOrderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }

  const valid = verifyRazorpaySignature(rzOrderId, paymentId, signature);
  if (!valid) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  const orders = await db.order.findMany({
    where: { paypalOrderId: rzOrderId },
    include: { items: true },
    take: 1,
  });
  const order = (orders[0] ?? null) as any;

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await db.order.update({
    where: { id: order.id },
    data: { status: "CONFIRMED", paymentId },
  });

  if (order.guestEmail) {
    try {
      await sendOrderConfirmation(
        order.guestEmail,
        order.orderNumber,
        order.items.map((i: any) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        order.total
      );
    } catch { /* non-fatal */ }
  }

  return NextResponse.json({ success: true, orderNumber: order.orderNumber });
}
