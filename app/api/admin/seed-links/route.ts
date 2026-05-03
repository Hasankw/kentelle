import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const PRODUCT_CATEGORIES: Record<string, string[]> = {
  "ceramide-cleanser": ["everyday-essentials"],
  "fruit-enzyme-cleanser": ["everyday-essentials"],
  "milk-cleanser": ["everyday-essentials"],
  "vitamin-b-facial-toner": ["everyday-essentials"],
  "relaxing-comforting-mist": ["everyday-essentials"],
  "bio-ferment-barrier-cream": ["everyday-essentials"],
  "collagen-cream": ["everyday-essentials"],
  "vitamin-c-20-cream": ["everyday-essentials"],
  "nightcare-moisturizer": ["everyday-essentials"],
  "night-beauty-repair": ["everyday-essentials"],
  "beautiful-eyes-tenor-sans": ["everyday-essentials"],
  "peel-back-retinol-serum": ["peel-and-glow"],
  "derma-glycolic-10-serum-ampoules": ["peel-and-glow"],
  "derma-peel-back-retinol-ampoules": ["peel-and-glow"],
  "glyco-15-body-lotion": ["peel-and-glow"],
  "modeling-mask-collagen": ["peel-and-glow"],
  "modeling-mask-cooling": ["peel-and-glow"],
  "modeling-mask-niacinamide": ["peel-and-glow"],
  "hyaluron-booster-capsules": ["skin-nutrients"],
  "hyaluron-booster-capsules-2": ["skin-nutrients"],
  "collagen-capsules": ["skin-nutrients"],
  "chonofirm-peptide-matrix": ["skin-nutrients"],
  "pdrn-pink-bio-cell-ampoules": ["skin-nutrients"],
  "dr-pen-needles": ["beauty-accessories"],
  "g-biomed-skin-cleanser": ["professional-use"],
  "derma-moisture-fix": ["professional-use"],
  "derma-moisture-fix-ampoules": ["professional-use"],
  "glyco-40-liquid-solution": ["professional-use"],
};

export async function POST() {
  const log: string[] = [];
  const { data: cats } = await supabase.from("Category").select("id,slug");
  const catMap: Record<string, string> = Object.fromEntries((cats ?? []).map((c: any) => [c.slug, c.id]));

  for (const [slug, catSlugs] of Object.entries(PRODUCT_CATEGORIES)) {
    const { data: product } = await supabase.from("Product").select("id").eq("slug", slug).maybeSingle();
    if (!product) { log.push(`[miss] ${slug}`); continue; }
    const pid = (product as any).id;
    await supabase.from("_ProductCategories").delete().eq("B", pid);
    const links = catSlugs.map((cs) => ({ A: catMap[cs], B: pid })).filter((l) => l.A);
    if (links.length) {
      const { error } = await supabase.from("_ProductCategories").insert(links);
      if (error) log.push(`[error] ${slug}: ${error.message}`);
      else log.push(`[ok] linked ${slug}`);
    }
  }
  return NextResponse.json({ ok: true, log });
}
