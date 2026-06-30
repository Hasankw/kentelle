import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: NextRequest) {
  const { topic, tone = "professional" } = await request.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
  if (!topic) return NextResponse.json({ error: "topic is required" }, { status: 400 });

  const prompt = `You are a skincare content writer for Kentelle Skincare, an Australian premium skincare brand.

Write a complete blog post about: "${topic}"
Tone: ${tone}

Return a JSON object with these exact keys:
- title: SEO-optimised title (max 60 chars)
- slug: URL slug (lowercase, hyphens only)
- excerpt: 1-2 sentence summary (max 160 chars)
- body: Full HTML body content (use <h2>, <h3>, <p>, <ul>, <li> tags, min 600 words)
- seoTitle: SEO title tag (max 60 chars, can differ from title)
- seoDescription: Meta description (max 160 chars)
- tags: array of 5 relevant tags
- focusKeyword: main SEO keyword phrase

Return ONLY the JSON object, no markdown fences.`;

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!res.ok) return NextResponse.json({ error: "Gemini API error" }, { status: 502 });

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  try {
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response", raw: text }, { status: 500 });
  }
}
