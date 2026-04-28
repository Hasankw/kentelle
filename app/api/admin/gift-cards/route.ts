import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateGiftCardCode } from "@/lib/utils";
import { sendGiftCard } from "@/lib/resend";

export async function GET() {
  const cards = await db.giftCard.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  const { recipientEmail, recipientName, senderName, amount, message, sendEmail } = await req.json();

  if (!recipientEmail || !amount || amount < 1) {
    return NextResponse.json({ error: "Recipient email and amount are required" }, { status: 400 });
  }

  const code = generateGiftCardCode();

  const card = await db.giftCard.create({
    data: {
      code,
      amount: parseFloat(amount),
      recipientEmail: recipientEmail.toLowerCase(),
      recipientName: recipientName || "",
      senderEmail: "admin@kentelle.com",
      senderName: senderName || "Kentelle",
      message: message || "",
      status: "ACTIVE",
    },
  });

  if (sendEmail) {
    try {
      await sendGiftCard(
        recipientEmail,
        recipientName || recipientEmail.split("@")[0],
        senderName || "Kentelle",
        parseFloat(amount),
        code,
        message || ""
      );
    } catch { /* non-fatal */ }
  }

  return NextResponse.json(card);
}
