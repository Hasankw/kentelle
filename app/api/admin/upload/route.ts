import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { optimizeImage } from "@/lib/imageOptimize";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const originalExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const bytes = await file.arrayBuffer();
  const { buffer, contentType, ext } = await optimizeImage(bytes, file.type, originalExt);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("products")
    .upload(filename, buffer, { contentType, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from("products").getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}
