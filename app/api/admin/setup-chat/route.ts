import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function POST() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 });
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "ChatSession" (
        "id"        TEXT NOT NULL,
        "sessionId" TEXT NOT NULL,
        "userEmail" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "ChatSession_sessionId_key" ON "ChatSession"("sessionId");

      CREATE TABLE IF NOT EXISTS "ChatMessage" (
        "id"        TEXT NOT NULL,
        "sessionId" TEXT NOT NULL,
        "role"      TEXT NOT NULL,
        "content"   TEXT NOT NULL,
        "metadata"  JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
      );
      CREATE INDEX IF NOT EXISTS "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");
    `);
    return NextResponse.json({ ok: true, message: "Chat tables created successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}
