import { NextResponse } from "next/server";
import { loadQuizConfig } from "@/lib/quiz/db-config";

// Public, read-only — the live quiz UI fetches its entire question set,
// options, and product data from here so admin edits take effect
// immediately with no redeploy.
export async function GET() {
  const config = await loadQuizConfig();
  return NextResponse.json(config);
}
