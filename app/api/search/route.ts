import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "12"), 24);

  if (!q || q.length < 2) return NextResponse.json({ products: [] });

  const { data, error } = await supabase
    .from("Product")
    .select("id, name, slug, price, salePrice, images")
    .eq("isActive", true)
    .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    .order("name", { ascending: true })
    .limit(limit);

  if (error) return NextResponse.json({ products: [] });
  return NextResponse.json({ products: data ?? [] });
}
