import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { askGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { sessionId, message, history = [] } = await req.json();
  if (!sessionId || !message) {
    return NextResponse.json({ error: "Missing sessionId or message" }, { status: 400 });
  }

  // Check if chatbot is enabled
  const rows = await db.content.findMany({ where: { key: "chatbot_enabled" } });
  const enabled = rows[0]?.value !== "false";
  if (!enabled) {
    return NextResponse.json({ error: "Chatbot is currently disabled" }, { status: 503 });
  }

  // Ensure session exists
  await db.chatSession.upsert(sessionId);

  // Save user message
  await db.chatMessage.create({
    data: { sessionId, role: "user", content: message },
  });

  let reply: string;
  try {
    reply = await askGemini(message, history);
  } catch {
    reply = "Sorry, I'm having trouble connecting right now. [COLLECT_EMAIL] Please leave your email and our team will get back to you shortly.";
  }

  // Parse product markers: [PRODUCT:slug:Name:price]
  const products: { slug: string; name: string; price: number }[] = [];
  const productRegex = /\[PRODUCT:([^:]+):([^:]+):(\d+(?:\.\d+)?)\]/g;
  let match;
  while ((match = productRegex.exec(reply)) !== null) {
    products.push({ slug: match[1], name: match[2], price: parseFloat(match[3]) });
  }

  const collectEmail = reply.includes("[COLLECT_EMAIL]");

  // Clean markers from display text
  const cleanReply = reply
    .replace(/\[PRODUCT:[^\]]+\]/g, "")
    .replace(/\[COLLECT_EMAIL\]/g, "")
    .trim();

  // Save assistant message
  await db.chatMessage.create({
    data: {
      sessionId,
      role: "assistant",
      content: cleanReply,
      metadata: products.length > 0 ? { products } : undefined,
    },
  });

  return NextResponse.json({ reply: cleanReply, products, collectEmail });
}
