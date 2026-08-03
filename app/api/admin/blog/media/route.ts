import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { optimizeImage } from "@/lib/imageOptimize";

const BUCKET = "products";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif", "svg"]);

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function isImagePath(path: string) {
  const ext = path.split(".").pop()?.toLowerCase();
  return !!ext && IMAGE_EXTENSIONS.has(ext);
}

async function listImages(supabase: ReturnType<typeof getSupabase>, prefix = "") {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(prefix, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });

  if (error) throw error;

  const items = await Promise.all(
    (data ?? []).map(async (item) => {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      const metadata = item.metadata as Record<string, unknown> | null;
      const isFolder = !metadata || (!metadata.mimetype && !isImagePath(path));

      if (isFolder) return listImages(supabase, path);
      if (!isImagePath(path)) return [];

      const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return [{
        name: item.name,
        path,
        url: publicData.publicUrl,
        size: typeof metadata.size === "number" ? metadata.size : null,
        mimeType: typeof metadata.mimetype === "string" ? metadata.mimetype : null,
        createdAt: item.created_at ?? null,
        updatedAt: item.updated_at ?? null,
      }];
    })
  );

  return items.flat().sort((a, b) => {
    const aTime = new Date(a.createdAt ?? a.updatedAt ?? 0).getTime();
    const bTime = new Date(b.createdAt ?? b.updatedAt ?? 0).getTime();
    return bTime - aTime;
  });
}

export async function GET() {
  try {
    const images = await listImages(getSupabase());
    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load media" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });

  const originalExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const bytes = await file.arrayBuffer();
  const { buffer, contentType, ext } = await optimizeImage(bytes, file.type, originalExt);
  const filename = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Upload as a Blob, not a raw Buffer: the Hostinger runtime's fetch
  // stringifies Buffer bodies, corrupting binary data (utf-8 mangling).
  const blob = new Blob([new Uint8Array(buffer)], { type: contentType });
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, blob, { contentType, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl, filename });
}
