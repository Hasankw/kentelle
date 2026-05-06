import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { capturePayPalOrder } from "@/lib/paypal";
import { sendOrderConfirmation, sendAdminOrderAlert, sendAdminFailedPaymentAlert } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { paypalOrderId } = await req.json();

  if (!paypalOrderId) {
    return NextResponse.json({ error: "Missing paypalOrderId" }, { status: 400 });
  }

  // Find order first so we have details for failure alerts
  const orders = await db.order.findMany({
    where: { paypalOrderId },
    include: { items: true },
    take: 1,
  });
  const order = (orders[0] ?? null) as any;

  // Capture the payment
  const capture = await capturePayPalOrder(paypalOrderId);
  if (!capture.success) {
    try {
      await sendAdminFailedPaymentAlert(
        order?.orderNumber ?? "—",
        order?.guestEmail ?? "—",
        order?.total ?? 0,
        "PayPal capture failed",
        "PayPal"
      );
    } catch { /* non-fatal */ }
    return NextResponse.json({ error: "Payment capture failed" }, { status: 400 });
  }

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

  // Send customer confirmation + admin alert (best-effort)
  const email = order.guestEmail;
  const addr = order.shippingAddress as any;
  const billing = addr?.billingAddress ?? null;
  const orderItems = order.items.map((i: any) => ({ name: i.name, image: i.image, quantity: i.quantity, price: i.price }));

  if (email) {
    try {
      await sendOrderConfirmation(
        email,
        order.orderNumber,
        orderItems,
        order.subtotal,
        order.shippingCost ?? 0,
        order.total,
        addr ? { fullName: addr.fullName, line1: addr.line1, line2: addr.line2, city: addr.city, state: addr.state, postcode: addr.postcode, phone: addr.phone } : undefined,
        order.discount ?? 0,
        order.couponCode ?? undefined,
        billing ? { fullName: billing.fullName, line1: billing.line1, line2: billing.line2, city: billing.city, state: billing.state, postcode: billing.postcode } : undefined,
      );
    } catch { /* non-fatal */ }
  }

  try {
    await sendAdminOrderAlert(
      order.orderNumber,
      email ?? "—",
      orderItems,
      order.subtotal,
      order.shippingCost ?? 0,
      order.total,
      order.couponCode ?? undefined,
      order.discount ?? 0,
      addr ? { fullName: addr.fullName, line1: addr.line1, line2: addr.line2, city: addr.city, state: addr.state, postcode: addr.postcode, phone: addr.phone } : undefined,
      "PayPal"
    );
  } catch { /* non-fatal */ }

  return NextResponse.json({
    success: true,
    orderNumber: order.orderNumber,
  });
}
