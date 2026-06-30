import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: NextRequest) {
  const { content, instruction } = await request.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
  if (!content || !instruction) return NextResponse.json({ error: "content and instruction are required" }, { status: 400 });

  const prompt = `You are a professional content editor for Kentelle Skincare, an Australian premium skincare brand.

Improve the following HTML blog content based on this instruction: "${instruction}"

Original content:
${content}

Return ONLY the improved HTML content (using the same HTML tags — <h2>, <h3>, <p>, <ul>, <li>, etc.).
Do not include any explanation or markdown fences. Return pure HTML only.`;

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!res.ok) return NextResponse.json({ error: "Gemini API error" }, { status: 502 });

  const data = await res.json();
  const html = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const clean = html.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();

  return NextResponse.json({ html: clean });
}
