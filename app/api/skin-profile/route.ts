import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.skinProfile.findUnique({ where: { userEmail: user.email!.toLowerCase() } });
  return NextResponse.json(profile ?? null);
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const email = user.email!.toLowerCase();

  const profile = await db.skinProfile.upsert({
    where: { userEmail: email },
    create: {
      userEmail: email,
      skinType: body.skinType,
      concerns: JSON.stringify(body.concerns ?? []),
      ageRange: body.ageRange ?? null,
      skinTone: body.skinTone ?? null,
    },
    update: {
      skinType: body.skinType,
      concerns: JSON.stringify(body.concerns ?? []),
      ageRange: body.ageRange ?? null,
      skinTone: body.skinTone ?? null,
    },
  });

  // Fetch recommended products
  const allProducts = await db.product.findMany({ where: { isActive: true } });
  const concerns: string[] = body.concerns ?? [];
  const skinType: string = body.skinType ?? "";

  const keywords = [skinType.toLowerCase(), ...concerns.map((c: string) => c.toLowerCase())];

  const scored = allProducts.map((p: any) => {
    let score = 0;
    const text = `${p.name} ${p.description ?? ""} ${(p.categories ?? []).map((c: any) => c.name).join(" ")}`.toLowerCase();
    keywords.forEach((kw) => { if (text.includes(kw)) score++; });
    return { ...p, _score: score };
  });

  scored.sort((a: any, b: any) => b._score - a._score);
  const recommended = scored.slice(0, 8);

  return NextResponse.json({ profile, recommended });
}
