-- Routine table for Kentelle skincare routines & clinical treatments
-- Run this once in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS "Routine" (
  "id"        TEXT NOT NULL,
  "title"     TEXT NOT NULL,
  "slug"      TEXT NOT NULL,
  "tagline"   TEXT,
  "category"  TEXT NOT NULL,
  "steps"     JSONB NOT NULL DEFAULT '[]',
  "tips"      JSONB,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Routine_slug_key" ON "Routine"("slug");
CREATE INDEX IF NOT EXISTS "Routine_category_idx" ON "Routine"("category");
CREATE INDEX IF NOT EXISTS "Routine_slug_idx" ON "Routine"("slug");
