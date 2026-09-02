import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Lightweight list for the quiz product-tagging admin page — just the
// fields needed to tag routine step + safety tags on real shop products.
export async function GET() {
  const products = await db.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const minimal = (products as any[]).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    images: p.images ?? [],
    quizStep: p.quizStep ?? null,
    quizTags: p.quizTags ?? [],
    quizAltGroup: p.quizAltGroup ?? null,
    quizRoutineTiming: p.quizRoutineTiming ?? null,
    quizFrequency: p.quizFrequency ?? null,
    quizPairWithIds: p.quizPairWithIds ?? [],
    quizBestMatchTags: p.quizBestMatchTags ?? [],
    quizAlternativeForTags: p.quizAlternativeForTags ?? [],
    comingSoon: !!p.comingSoon,
  }));
  return NextResponse.json(minimal);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const {
    id,
    quizStep,
    quizTags,
    quizAltGroup,
    quizRoutineTiming,
    quizFrequency,
    quizPairWithIds,
    quizBestMatchTags,
    quizAlternativeForTags,
  } = body;
  const product = await db.product.update({
    where: { id },
    data: {
      quizStep: quizStep || null,
      quizTags: quizTags ?? [],
      quizAltGroup: quizAltGroup || null,
      quizRoutineTiming: quizRoutineTiming || null,
      quizFrequency: quizFrequency || null,
      quizPairWithIds: quizPairWithIds ?? [],
      quizBestMatchTags: quizBestMatchTags ?? [],
      quizAlternativeForTags: quizAlternativeForTags ?? [],
    },
  });
  return NextResponse.json(product);
}
