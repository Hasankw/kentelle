import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPayPalOrder } from "@/lib/paypal";
import { generateOrderNumber } from "@/lib/utils";
import type { CartItem, ShippingAddress } from "@/types";

async function getShippingCost(subtotal: number): Promise<number> {
  try {
    const rows = await db.content.findMany({
      where: { key: { in: ["shipping_type", "shipping_rate", "free_shipping_threshold"] } },
    });
    const s = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
    const type = (s.shipping_type as string) ?? "threshold";
    const rate = parseFloat(s.shipping_rate ?? "9.95");
    const threshold = parseFloat(s.free_shipping_threshold ?? "80");
    if (type === "free") return 0;
    if (type === "fixed") return rate;
    return subtotal >= threshold ? 0 : rate;
  } catch {
    return subtotal >= 80 ? 0 : 9.95;
  }
}

export async function POST(req: NextRequest) {
  const {
    items,
    shippingAddress,
    billingAddress,
    email,
    total,
    couponCode,
    discount,
  }: {
    items: CartItem[];
    shippingAddress: ShippingAddress;
    billingAddress?: ShippingAddress;
    email: string;
    total: number;
    couponCode?: string;
    discount?: number;
  } = await req.json();

  if (!items?.length || !shippingAddress || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = await getShippingCost(subtotal);
  const serverTotal = parseFloat((subtotal + shippingCost).toFixed(2));

  // Create PayPal order first to get ID
  const paypalOrderId = await createPayPalOrder(serverTotal, "AUD");

  const storedAddress = billingAddress
    ? { ...shippingAddress, billingAddress }
    : shippingAddress;

  // Create order in DB
  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      guestEmail: email,
      subtotal,
      shippingCost,
      total: serverTotal,
      paypalOrderId,
      shippingAddress: JSON.parse(JSON.stringify(storedAddress)),
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

  return NextResponse.json({ paypalOrderId, orderId: order.id });
}
