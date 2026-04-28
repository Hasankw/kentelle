import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { db } from "@/lib/db";
import { generateGiftCardCode } from "@/lib/utils";
import { sendGiftCard } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { paypalOrderId, amount, recipientEmail, recipientName, senderEmail, senderName, message } =
    await req.json();

  if (!paypalOrderId || !amount || !recipientEmail || !senderEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const capture = await capturePayPalOrder(paypalOrderId);
  if (!capture.success) {
    return NextResponse.json({ error: "Payment capture failed" }, { status: 400 });
  }

  const code = generateGiftCardCode();

  await db.giftCard.create({
    data: {
      code,
      amount: parseFloat(Number(amount).toFixed(2)),
      recipientEmail: recipientEmail.toLowerCase().trim(),
      recipientName: recipientName ?? "",
      senderEmail: senderEmail.toLowerCase().trim(),
      senderName: senderName ?? "",
      message: message ?? "",
      status: "ACTIVE",
    },
  });

  try {
    await sendGiftCard(
      recipientEmail,
      recipientName ?? "",
      senderName || senderEmail,
      Number(amount),
      code,
      message ?? ""
    );
  } catch {
    // non-fatal
  }

  return NextResponse.json({ success: true, code });
}
