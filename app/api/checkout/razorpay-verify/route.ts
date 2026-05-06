import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendOrderConfirmation, sendAdminOrderAlert, sendAdminFailedPaymentAlert } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { rzOrderId, paymentId, signature } = await req.json();

  if (!rzOrderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }

  const orders = await db.order.findMany({
    where: { paypalOrderId: rzOrderId },
    include: { items: true },
    take: 1,
  });
  const order = (orders[0] ?? null) as any;

  const valid = await verifyRazorpaySignature(rzOrderId, paymentId, signature);
  if (!valid) {
    try {
      await sendAdminFailedPaymentAlert(
        order?.orderNumber ?? "—",
        order?.guestEmail ?? "—",
        order?.total ?? 0,
        "Razorpay signature verification failed",
        "Razorpay"
      );
    } catch { /* non-fatal */ }
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await db.order.update({
    where: { id: order.id },
    data: { status: "CONFIRMED", paymentId },
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

  const emailTo = order.guestEmail || order.customer?.email;
  const addr = order.shippingAddress as any;
  const billing = addr?.billingAddress ?? null;
  const orderItems = order.items.map((i: any) => ({ name: i.name, image: i.image, quantity: i.quantity, price: i.price }));

  if (emailTo) {
    try {
      await sendOrderConfirmation(
        emailTo,
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
      emailTo ?? "—",
      orderItems,
      order.subtotal,
      order.shippingCost ?? 0,
      order.total,
      order.couponCode ?? undefined,
      order.discount ?? 0,
      addr ? { fullName: addr.fullName, line1: addr.line1, line2: addr.line2, city: addr.city, state: addr.state, postcode: addr.postcode, phone: addr.phone } : undefined,
      "Razorpay"
    );
  } catch { /* non-fatal */ }

  return NextResponse.json({ success: true, orderNumber: order.orderNumber });
}
