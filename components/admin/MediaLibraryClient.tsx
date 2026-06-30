"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Image as ImageIcon, Loader2, Upload } from "lucide-react";

interface MediaItem {
  name: string;
  path: string;
  url: string;
  size: number | null;
  mimeType: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

function formatSize(size: number | null) {
  if (!size) return "Unknown size";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryClient() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return images;
    return images.filter((image) => image.name.toLowerCase().includes(q) || image.path.toLowerCase().includes(q));
  }, [images, query]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog/media", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load media");
      setImages(data.images ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/blog/media", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied((current) => (current === url ? "" : current)), 1800);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-navy">Media Library</h1>
          <p className="text-xs font-body text-brand-contrast mt-1">{images.length} images in storage</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search images"
            className="w-56 border border-brand-contrast/20 bg-white px-3 py-2 text-sm font-body text-brand-navy focus:outline-none focus:border-brand-blue"
          />
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => upload(event.target.files?.[0] ?? null)} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-brand-accent text-brand-navy rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Upload
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600 font-body">{error}</p>}

      {loading ? (
        <div className="bg-white border border-brand-contrast/10 py-16 text-center text-brand-contrast font-body">
          <Loader2 size={18} className="animate-spin mx-auto mb-2" />
          Loading media...
        </div>
      ) : filtered.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtered.map((image) => (
            <div key={image.path} className="bg-white border border-brand-contrast/10">
              <div className="aspect-square bg-[#F8F9FC] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={image.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-3">
                <p className="text-xs font-heading font-bold text-brand-navy truncate" title={image.path}>{image.name}</p>
                <p className="text-[10px] font-body text-brand-contrast mt-1">{formatSize(image.size)}</p>
                <button
                  type="button"
                  onClick={() => copyUrl(image.url)}
                  className="mt-3 w-full inline-flex items-center justify-center gap-1.5 border border-brand-contrast/20 px-2 py-1.5 text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast hover:text-brand-navy hover:border-brand-navy transition-colors"
                >
                  <Copy size={11} />
                  {copied === image.url ? "Copied" : "Copy URL"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-brand-contrast/10 py-16 text-center">
          <ImageIcon size={28} className="mx-auto text-brand-contrast/50 mb-3" />
          <p className="font-heading font-bold text-brand-navy">No images found</p>
          <p className="text-sm font-body text-brand-contrast mt-1">Upload an image to add it to the library.</p>
        </div>
      )}
    </div>
  );
}
