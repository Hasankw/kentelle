-- Chat tables for Kentelle AI chatbot
-- Run this once in your Supabase SQL editor

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
