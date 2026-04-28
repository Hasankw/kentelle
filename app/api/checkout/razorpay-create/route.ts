import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createRazorpayOrder } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/utils";
import type { CartItem, ShippingAddress } from "@/types";

export async function POST(req: NextRequest) {
  const { items, shippingAddress, email, total, couponCode, discount }: {
    items: CartItem[];
    shippingAddress: ShippingAddress;
    email: string;
    total: number;
    couponCode?: string;
    discount?: number;
  } = await req.json();

  if (!items?.length || !shippingAddress || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const rzOrder = await createRazorpayOrder(total);

  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      guestEmail: email,
      subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
      shippingCost: 0,
      total: parseFloat(Number(total).toFixed(2)),
      paypalOrderId: rzOrder.id,
      shippingAddress: JSON.parse(JSON.stringify(shippingAddress)),
      status: "PENDING",
      ...(couponCode ? { couponCode } : {}),
      ...(discount ? { discount: parseFloat(Number(discount).toFixed(2)) } : {}),
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

  return NextResponse.json({
    rzOrderId: rzOrder.id,
    amount: rzOrder.amount,
    currency: rzOrder.currency,
    orderId: order.id,
    keyId: rzOrder.keyId,
  });
}
