import sharp from "sharp";

const MAX_DIM = 1600;

/** Formats we re-encode; everything else (gif, svg, avif) passes through untouched. */
const COMPRESSIBLE = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface OptimizedImage {
  buffer: Buffer;
  contentType: string;
  ext: string;
}

/**
 * Resize to fit within 1600px and re-encode as WebP (q80). Falls back to the
 * original bytes if the input can't be decoded or the result isn't smaller.
 */
export async function optimizeImage(
  input: ArrayBuffer,
  mimeType: string,
  originalExt: string
): Promise<OptimizedImage> {
  const original = Buffer.from(input);
  const passthrough = { buffer: original, contentType: mimeType, ext: originalExt };

  if (!COMPRESSIBLE.has(mimeType)) return passthrough;

  try {
    const img = sharp(original, { failOn: "none" })
      .rotate()
      .resize(MAX_DIM, MAX_DIM, { fit: "inside", withoutEnlargement: true });
    const out = await img.webp({ quality: 80 }).toBuffer();
    if (out.length >= original.length) return passthrough;
    return { buffer: out, contentType: "image/webp", ext: "webp" };
  } catch {
    return passthrough;
  }
}
