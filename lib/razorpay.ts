import Razorpay from "razorpay";
import crypto from "crypto";
import { db } from "@/lib/db";

async function getRazorpayKeys(): Promise<{ keyId: string; keySecret: string }> {
  // Try DB first (admin-configurable), fall back to env vars
  try {
    const rows = await db.content.findMany({
      where: { key: { in: ["razorpay_key_id", "razorpay_key_secret"] } },
    });
    const s = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
    if (s.razorpay_key_id && s.razorpay_key_secret) {
      return { keyId: s.razorpay_key_id, keySecret: s.razorpay_key_secret };
    }
  } catch { /* fall through to env */ }

  const keyId = process.env.RAZORPAY_KEY_ID ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
  if (!keyId || !keySecret) throw new Error("Razorpay keys not configured");
  return { keyId, keySecret };
}

export async function createRazorpayOrder(amountAUD: number) {
  const { keyId, keySecret } = await getRazorpayKeys();
  const rz = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const order = await rz.orders.create({
    amount: Math.round(amountAUD * 100),
    currency: "INR",
    receipt: `order_${Date.now()}`,
  });
  return { ...order, keyId };
}

export async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const { keySecret } = await getRazorpayKeys();
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
  return expected === signature;
}
