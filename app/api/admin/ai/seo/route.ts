import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: NextRequest) {
  const { title, content, seoTitle, seoDescription, focusKeyword } = await request.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });

  const wordCount = (content ?? "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  const kwLower = (focusKeyword ?? "").toLowerCase();
  const contentLower = (content ?? "").toLowerCase();
  const kwOccurrences = kwLower ? (contentLower.match(new RegExp(kwLower, "g")) ?? []).length : 0;
  const keywordDensity = wordCount > 0 ? Math.round((kwOccurrences / wordCount) * 1000) / 10 : 0;

  const prompt = `You are an SEO expert analysing a skincare blog post for Kentelle Skincare (Australia).

Post details:
- Title: ${title}
- SEO Title: ${seoTitle || "(not set)"}
- Meta Description: ${seoDescription || "(not set)"}
- Focus Keyword: ${focusKeyword || "(not set)"}
- Word count: ${wordCount}
- Keyword density: ${keywordDensity}%
- Content excerpt: ${(content ?? "").replace(/<[^>]+>/g, " ").slice(0, 500)}

Return a JSON object with:
- seoScore: number 0-100 (overall SEO score)
- readabilityScore: number 0-100 (readability score)
- keywordDensity: number (keyword density percentage, use the value I provided)
- suggestions: array of 3-5 specific, actionable improvement suggestions (strings)

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
    return NextResponse.json({ ...parsed, keywordDensity });
  } catch {
    return NextResponse.json({
      seoScore: 50,
      readabilityScore: 50,
      keywordDensity,
      suggestions: ["Add your focus keyword to the SEO title", "Write a meta description (120-160 characters)", "Add more subheadings (H2/H3) to improve structure"],
    });
  }
}
