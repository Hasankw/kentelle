import { createSupabaseServiceClient } from "./server";

const BUCKET = "product-images";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}`);
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File exceeds 5MB limit");
  }

  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { contentType: file.type, upsert: false });

  if (error) throw error;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}

export async function deleteProductImage(url: string): Promise<void> {
  const filename = url.split(`/${BUCKET}/`)[1];
  if (!filename) return;
  const supabase = createSupabaseServiceClient();
  await supabase.storage.from(BUCKET).remove([filename]);
}
