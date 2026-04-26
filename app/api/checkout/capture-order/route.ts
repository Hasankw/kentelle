import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { capturePayPalOrder } from "@/lib/paypal";
import { sendOrderConfirmation } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { paypalOrderId } = await req.json();

  if (!paypalOrderId) {
    return NextResponse.json({ error: "Missing paypalOrderId" }, { status: 400 });
  }

  // Capture the payment
  const capture = await capturePayPalOrder(paypalOrderId);
  if (!capture.success) {
    return NextResponse.json({ error: "Payment capture failed" }, { status: 400 });
  }

  // Find and update order
  const order = await db.order.findFirst({
    where: { paypalOrderId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      status: "CONFIRMED",
      paymentId: capture.captureId,
    },
  });

  // Send confirmation email (best-effort)
  const email = order.guestEmail;
  if (email) {
    try {
      await sendOrderConfirmation(
        email,
        order.orderNumber,
        order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        order.total
      );
    } catch {
      // Non-fatal — email failure should not block the order
    }
  }

  return NextResponse.json({
    success: true,
    orderNumber: order.orderNumber,
  });
}
