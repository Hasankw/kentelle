import Razorpay from "razorpay";
import crypto from "crypto";

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay keys not configured");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createRazorpayOrder(amountAUD: number) {
  const rz = getRazorpay();
  // amount in smallest currency unit (paise for INR, cents for AUD — Razorpay test uses INR)
  const order = await rz.orders.create({
    amount: Math.round(amountAUD * 100),
    currency: "INR",
    receipt: `order_${Date.now()}`,
  });
  return order;
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
  return expected === signature;
}
