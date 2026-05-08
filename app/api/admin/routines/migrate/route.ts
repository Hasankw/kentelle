import { NextResponse } from "next/server";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";

const SQL = `
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
`.trim();

export async function POST() {
  // Try pg Pool first (works when direct connection is available)
  if (process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
    try {
      await pool.query(SQL);
      await pool.end();
      return NextResponse.json({ ok: true, method: "pg", message: "Routine table created successfully" });
    } catch {
      try { await pool.end(); } catch {}
    }
  }

  // Fallback: check if table already exists via Supabase JS client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { error } = await supabase.from("Routine").select("id").limit(1);
  if (!error) {
    return NextResponse.json({ ok: true, method: "exists", message: "Routine table already exists" });
  }

  // Table doesn't exist and we can't create it via pooler — return SQL for manual execution
  return NextResponse.json({
    ok: false,
    needsManual: true,
    message: "Run this SQL in your Supabase SQL Editor",
    sql: SQL,
  }, { status: 200 });
}

export async function GET() {
  // Check table existence
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { error } = await supabase.from("Routine").select("id").limit(1);
  return NextResponse.json({ exists: !error, sql: error ? SQL : null });
}
