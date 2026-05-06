import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const sessions = await db.chatSession.findMany({ orderBy: { createdAt: "desc" } });

  // Attach last message preview to each session
  const enriched = await Promise.all(
    sessions.map(async (s: any) => {
      const messages = await db.chatMessage.findMany({
        where: { sessionId: s.sessionId },
        orderBy: { createdAt: "desc" },
        take: 1,
      });
      return { ...s, lastMessage: messages[0] ?? null };
    })
  );

  return NextResponse.json(enriched);
}
