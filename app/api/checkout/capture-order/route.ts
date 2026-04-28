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
  const orders = await db.order.findMany({
    where: { paypalOrderId },
    include: { items: true },
    take: 1,
  });
  const order = (orders[0] ?? null) as any;

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

  // Upsert customer so guest purchasers appear in admin
  const guestEmail = order.guestEmail;
  if (guestEmail && !order.customerId) {
    const addr = order.shippingAddress as any;
    try {
      await db.customer.upsert({
        where: { email: guestEmail },
        create: { name: addr?.fullName ?? guestEmail, email: guestEmail, phone: addr?.phone ?? null },
        update: {},
      });
    } catch { /* non-fatal */ }
  }

  // Send confirmation email (best-effort)
  const email = order.guestEmail;
  if (email) {
    try {
      const addr = order.shippingAddress as any;
      await sendOrderConfirmation(
        email,
        order.orderNumber,
        order.items.map((i) => ({ name: i.name, image: i.image, quantity: i.quantity, price: i.price })),
        order.subtotal,
        order.shippingCost ?? 0,
        order.total,
        addr ? { fullName: addr.fullName, line1: addr.line1, line2: addr.line2, city: addr.city, state: addr.state, postcode: addr.postcode, phone: addr.phone } : undefined,
        order.discount ?? 0,
        order.couponCode ?? undefined
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
