import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOrderStatusUpdate } from "@/lib/resend";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await request.json();

  const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await db.order.update({ where: { id }, data: { status } });

  // Resolve customer email then send status email (non-blocking)
  (async () => {
    try {
      let email: string | null = (order as any).guestEmail ?? null;
      if (!email && (order as any).customerId) {
        const customer = await db.customer.findUnique({ where: { id: (order as any).customerId } });
        email = (customer as any)?.email ?? null;
      }
      if (email) await sendOrderStatusUpdate(email, (order as any).orderNumber, status);
    } catch {}
  })();

  return NextResponse.json({ ok: true });
}
