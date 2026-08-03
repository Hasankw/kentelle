"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

interface MediaItem {
  name: string;
  path: string;
  url: string;
  size: number | null;
  mimeType: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

const PAGE_SIZE = 15;

function formatSize(size: number | null) {
  if (!size) return "Unknown size";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MediaLibraryClient() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [openItem, setOpenItem] = useState<MediaItem | null>(null);
  const [confirmSingle, setConfirmSingle] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return images;
    return images.filter((image) => image.name.toLowerCase().includes(q) || image.path.toLowerCase().includes(q));
  }, [images, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );
  const allOnPageSelected = pageItems.length > 0 && pageItems.every((item) => selected.has(item.path));

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog/media", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load media");
      const items: MediaItem[] = data.images ?? [];
      setImages(items);
      // Drop selections that no longer exist
      setSelected((prev) => {
        const paths = new Set(items.map((item) => item.path));
        return new Set([...prev].filter((path) => paths.has(path)));
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenItem(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setConfirmSingle(false);
  }, [openItem]);

  useEffect(() => {
    setConfirmBulk(false);
  }, [selected]);

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
      setPage(1);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const deleteMedia = async (paths: string[]) => {
    if (!paths.length) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setOpenItem((current) => (current && paths.includes(current.path) ? null : current));
      setSelected((prev) => new Set([...prev].filter((path) => !paths.includes(path))));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
      setConfirmBulk(false);
      setConfirmSingle(false);
    }
  };

  const toggleSelect = (path: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const togglePageSelection = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageItems.forEach((item) => next.delete(item.path));
      else pageItems.forEach((item) => next.add(item.path));
      return next;
    });
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
          <p className="text-xs font-body text-brand-contrast mt-1">
            {images.length} images in storage
            {query.trim() ? ` · ${filtered.length} matching` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
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

      {!loading && filtered.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 bg-white border border-brand-contrast/10 px-4 py-3">
          <label className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast cursor-pointer select-none">
            <input type="checkbox" checked={allOnPageSelected} onChange={togglePageSelection} className="accent-brand-navy" />
            Select page
          </label>
          {selected.size > 0 && (
            <>
              <span className="text-xs font-body text-brand-navy">{selected.size} selected</span>
              <button
                type="button"
                onClick={() => (confirmBulk ? deleteMedia([...selected]) : setConfirmBulk(true))}
                disabled={deleting}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-heading font-bold uppercase tracking-wider border transition-colors disabled:opacity-50 ${
                  confirmBulk
                    ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
                    : "border-red-300 text-red-600 hover:border-red-600"
                }`}
              >
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                {confirmBulk ? `Confirm delete ${selected.size}?` : "Delete selected"}
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-[11px] font-heading font-bold uppercase tracking-wider text-brand-contrast hover:text-brand-navy transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-brand-contrast/10 py-16 text-center text-brand-contrast font-body">
          <Loader2 size={18} className="animate-spin mx-auto mb-2" />
          Loading media...
        </div>
      ) : pageItems.length ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {pageItems.map((image) => {
              const isSelected = selected.has(image.path);
              return (
                <div key={image.path} className={`bg-white border ${isSelected ? "border-brand-navy" : "border-brand-contrast/10"}`}>
                  <div className="relative aspect-square bg-[#F8F9FC] overflow-hidden group">
                    <button
                      type="button"
                      onClick={() => setOpenItem(image)}
                      className="block w-full h-full cursor-zoom-in"
                      title="Open media"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.url} alt={image.name} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSelect(image.path)}
                      title={isSelected ? "Deselect" : "Select"}
                      className={`absolute top-2 left-2 w-6 h-6 inline-flex items-center justify-center border transition-colors ${
                        isSelected
                          ? "bg-brand-navy border-brand-navy text-white"
                          : "bg-white/90 border-brand-contrast/30 text-transparent hover:text-brand-contrast/50"
                      }`}
                    >
                      <Check size={14} />
                    </button>
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
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center w-8 h-8 border border-brand-contrast/20 text-brand-contrast hover:text-brand-navy hover:border-brand-navy transition-colors disabled:opacity-40 disabled:pointer-events-none"
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 text-xs font-heading font-bold border transition-colors ${
                    n === currentPage
                      ? "bg-brand-navy border-brand-navy text-white"
                      : "border-brand-contrast/20 text-brand-contrast hover:text-brand-navy hover:border-brand-navy"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center w-8 h-8 border border-brand-contrast/20 text-brand-contrast hover:text-brand-navy hover:border-brand-navy transition-colors disabled:opacity-40 disabled:pointer-events-none"
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white border border-brand-contrast/10 py-16 text-center">
          <ImageIcon size={28} className="mx-auto text-brand-contrast/50 mb-3" />
          <p className="font-heading font-bold text-brand-navy">No images found</p>
          <p className="text-sm font-body text-brand-contrast mt-1">Upload an image to add it to the library.</p>
        </div>
      )}

      {openItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setOpenItem(null)}
        >
          <div
            className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-brand-contrast/10 px-5 py-3">
              <h2 className="font-heading font-bold text-sm text-brand-navy truncate pr-4" title={openItem.path}>
                {openItem.name}
              </h2>
              <button
                type="button"
                onClick={() => setOpenItem(null)}
                className="text-brand-contrast hover:text-brand-navy transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid md:grid-cols-[1fr_260px]">
              <div className="bg-[#F8F9FC] flex items-center justify-center p-4 min-h-[280px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={openItem.url} alt={openItem.name} className="max-w-full max-h-[60vh] object-contain" />
              </div>
              <div className="p-5 border-t md:border-t-0 md:border-l border-brand-contrast/10">
                <dl className="space-y-3 text-xs font-body">
                  <div>
                    <dt className="font-heading font-bold uppercase tracking-wider text-[10px] text-brand-contrast">File path</dt>
                    <dd className="text-brand-navy break-all mt-0.5">{openItem.path}</dd>
                  </div>
                  <div>
                    <dt className="font-heading font-bold uppercase tracking-wider text-[10px] text-brand-contrast">Type</dt>
                    <dd className="text-brand-navy mt-0.5">{openItem.mimeType ?? "Unknown"}</dd>
                  </div>
                  <div>
                    <dt className="font-heading font-bold uppercase tracking-wider text-[10px] text-brand-contrast">Size</dt>
                    <dd className="text-brand-navy mt-0.5">{formatSize(openItem.size)}</dd>
                  </div>
                  <div>
                    <dt className="font-heading font-bold uppercase tracking-wider text-[10px] text-brand-contrast">Uploaded</dt>
                    <dd className="text-brand-navy mt-0.5">{formatDate(openItem.createdAt)}</dd>
                  </div>
                </dl>
                <div className="mt-5 space-y-2">
                  <button
                    type="button"
                    onClick={() => copyUrl(openItem.url)}
                    className="w-full inline-flex items-center justify-center gap-1.5 border border-brand-contrast/20 px-3 py-2 text-[11px] font-heading font-bold uppercase tracking-wider text-brand-contrast hover:text-brand-navy hover:border-brand-navy transition-colors"
                  >
                    <Copy size={12} />
                    {copied === openItem.url ? "Copied" : "Copy URL"}
                  </button>
                  <a
                    href={openItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 border border-brand-contrast/20 px-3 py-2 text-[11px] font-heading font-bold uppercase tracking-wider text-brand-contrast hover:text-brand-navy hover:border-brand-navy transition-colors"
                  >
                    <ExternalLink size={12} />
                    Open original
                  </a>
                  <button
                    type="button"
                    onClick={() => (confirmSingle ? deleteMedia([openItem.path]) : setConfirmSingle(true))}
                    disabled={deleting}
                    className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-heading font-bold uppercase tracking-wider border transition-colors disabled:opacity-50 ${
                      confirmSingle
                        ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
                        : "border-red-300 text-red-600 hover:border-red-600"
                    }`}
                  >
                    {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    {confirmSingle ? "Confirm delete?" : "Delete permanently"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
