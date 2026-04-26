import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPayPalOrder } from "@/lib/paypal";
import { generateOrderNumber } from "@/lib/utils";
import type { CartItem, ShippingAddress } from "@/types";

export async function POST(req: NextRequest) {
  const {
    items,
    shippingAddress,
    email,
    total,
  }: {
    items: CartItem[];
    shippingAddress: ShippingAddress;
    email: string;
    total: number;
  } = await req.json();

  if (!items?.length || !shippingAddress || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 80 ? 0 : 9.95;
  const serverTotal = parseFloat((subtotal + shippingCost).toFixed(2));

  // Create PayPal order first to get ID
  const paypalOrderId = await createPayPalOrder(serverTotal, "AUD");

  // Create order in DB
  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      guestEmail: email,
      subtotal,
      shippingCost,
      total: serverTotal,
      paypalOrderId,
      shippingAddress: JSON.parse(JSON.stringify(shippingAddress)),
      status: "PENDING",
      items: {
        create: items.map((item) => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
  });

  return NextResponse.json({ paypalOrderId, orderId: order.id });
}
