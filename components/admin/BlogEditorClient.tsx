"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft, Eye, RotateCcw, ChevronDown, ChevronUp,
  X, Sparkles, CheckCircle2, Clock, Star, Tag,
  FolderOpen, Image as ImageIcon, Search as SearchIcon, Loader2,
  Upload,
} from "lucide-react";
import { slugify } from "@/lib/utils";

const TipTapEditor = dynamic(() => import("@/components/admin/TipTapEditor"), { ssr: false });

interface Revision { timestamp: string; title: string; excerpt: string; body: string; }
interface BlogPost {
  id: string; title: string; slug: string; excerpt: string; body: string;
  coverImage: string; status: string; postType: string;
  seoTitle: string; seoDescription: string; focusKeyword: string;
  tags: string[]; categories: string[];
  authorName: string; authorAvatarUrl: string; authorBio: string;
  readingTime: number | null; isFeatured: boolean;
  publishedAt: string | null; revisions: Revision[];
}
interface MediaItem {
  name: string;
  path: string;
  url: string;
  size: number | null;
  mimeType: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/* ─── Sidebar section ───────────────────────────────────────────────────── */
function Panel({ title, icon, children, defaultOpen = true }: {
  title: string; icon?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-brand-contrast/10">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F8F9FC] transition-colors">
        <span className="flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-navy">
          {icon}{title}
        </span>
        {open ? <ChevronUp size={13} className="text-brand-contrast" /> : <ChevronDown size={13} className="text-brand-contrast" />}
      </button>
      {open && <div className="px-4 pb-4 pt-2 space-y-3">{children}</div>}
    </div>
  );
}

/* ─── Tag chip input ────────────────────────────────────────────────────── */
function TagInput({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };
  return (
    <div>
      {label && <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast mb-1.5">{label}</label>}
      <div className="flex flex-wrap gap-1 mb-2">
        {values.map((t) => (
          <span key={t} className="flex items-center gap-1 bg-brand-navy/10 text-brand-navy text-[10px] px-2 py-0.5 rounded-full">
            {t}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== t))} className="hover:text-red-500"><X size={9} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder="Type and press Enter"
          className="flex-1 border border-brand-contrast/20 px-2 py-1.5 text-xs font-body bg-white focus:outline-none focus:border-brand-blue" />
        <button type="button" onClick={add} className="px-2 py-1.5 bg-brand-navy text-white text-xs hover:bg-brand-blue transition-colors">+</button>
      </div>
    </div>
  );
}

/* ─── AI Assistant ──────────────────────────────────────────────────────── */
function AiPanel({ post, onApply }: { post: BlogPost; onApply: (u: Partial<BlogPost>) => void }) {
  const [tab, setTab] = useState<"write" | "improve" | "seo">("write");
  const [topic, setTopic] = useState(""); const [tone, setTone] = useState("professional");
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [seoResult, setSeoResult] = useState<{ seoScore: number; readabilityScore: number; keywordDensity: number; suggestions: string[] } | null>(null);
  const [error, setError] = useState("");

  const run = async (url: string, body: object, onSuccess: (d: unknown) => void) => {
    setLoading(true); setError("");
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Request failed");
      onSuccess(await res.json());
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="border border-brand-accent/30 bg-gradient-to-b from-brand-accent/5 to-white mt-4">
      <div className="px-4 py-3 border-b border-brand-contrast/10 flex items-center gap-2">
        <Sparkles size={13} className="text-brand-accent" />
        <span className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy">AI Assistant</span>
      </div>
      <div className="flex border-b border-brand-contrast/10">
        {(["write", "improve", "seo"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 py-2 text-[10px] font-heading font-bold uppercase tracking-wider transition-colors ${tab === t ? "bg-brand-navy text-white" : "text-brand-contrast hover:bg-brand-contrast/5"}`}>
            {t === "seo" ? "SEO Check" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-3">
        {tab === "write" && (
          <>
            <textarea rows={2} value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic: e.g. Benefits of hyaluronic acid for dry skin"
              className="w-full border border-brand-contrast/20 px-2 py-1.5 text-xs font-body bg-white focus:outline-none focus:border-brand-blue resize-none" />
            <select value={tone} onChange={(e) => setTone(e.target.value)}
              className="w-full border border-brand-contrast/20 px-2 py-1.5 text-xs font-body bg-white focus:outline-none focus:border-brand-blue">
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="educational">Educational</option>
              <option value="persuasive">Persuasive</option>
            </select>
            <button type="button" onClick={() => run("/api/admin/ai/write", { topic, tone }, (d) => onApply(d as Partial<BlogPost>))}
              disabled={loading || !topic}
              className="w-full py-2 bg-brand-navy text-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50">
              {loading ? "Generating…" : "Generate Post"}
            </button>
          </>
        )}
        {tab === "improve" && (
          <>
            <textarea rows={3} value={instruction} onChange={(e) => setInstruction(e.target.value)}
              placeholder="Instruction: e.g. Make it more conversational"
              className="w-full border border-brand-contrast/20 px-2 py-1.5 text-xs font-body bg-white focus:outline-none focus:border-brand-blue resize-none" />
            <button type="button" onClick={() => run("/api/admin/ai/improve", { content: post.body, instruction }, (d) => onApply({ body: (d as { html: string }).html }))}
              disabled={loading || !instruction}
              className="w-full py-2 bg-brand-navy text-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50">
              {loading ? "Improving…" : "Improve Content"}
            </button>
          </>
        )}
        {tab === "seo" && (
          <>
            <button type="button"
              onClick={() => run("/api/admin/ai/seo", { title: post.title, content: post.body, seoTitle: post.seoTitle, seoDescription: post.seoDescription, focusKeyword: post.focusKeyword },
                (d) => setSeoResult(d as typeof seoResult))}
              disabled={loading}
              className="w-full py-2 bg-brand-navy text-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50">
              {loading ? "Analysing…" : "Run SEO Check"}
            </button>
            {seoResult && (
              <div className="space-y-2 mt-1">
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {[{ l: "SEO", v: seoResult.seoScore }, { l: "Read.", v: seoResult.readabilityScore }, { l: "KW%", v: `${seoResult.keywordDensity}%` }].map((m) => (
                    <div key={m.l} className="bg-[#F8F9FC] p-2 rounded">
                      <p className="text-base font-heading font-bold text-brand-navy">{m.v}</p>
                      <p className="text-[9px] text-brand-contrast uppercase tracking-wider">{m.l}</p>
                    </div>
                  ))}
                </div>
                <ul className="space-y-1">{seoResult.suggestions.map((s, i) => (
                  <li key={i} className="text-[10px] font-body text-brand-contrast flex gap-1"><span className="text-brand-accent mt-0.5">•</span>{s}</li>
                ))}</ul>
              </div>
            )}
          </>
        )}
        {error && <p className="text-[10px] text-red-600">{error}</p>}
      </div>
    </div>
  );
}

/* ─── Main editor ───────────────────────────────────────────────────────── */
export default function BlogEditorClient({ initialPost }: { initialPost: BlogPost }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost>(initialPost);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coverUploadRef = useRef<HTMLInputElement | null>(null);
  const isDirty = useRef(false);

  const set = useCallback(<K extends keyof BlogPost>(key: K, value: BlogPost[K]) => {
    setPost((prev) => ({ ...prev, [key]: value }));
    isDirty.current = true;
  }, []);

  const calcReadingTime = (html: string) =>
    Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length / 200));

  const save = useCallback(async (postData: BlogPost) => {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/admin/blog/${postData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...postData,
          readingTime: calcReadingTime(postData.body),
          published: postData.status === "published",
          publishedAt: postData.status === "published" && !postData.publishedAt ? new Date().toISOString() : postData.publishedAt,
        }),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setPost((prev) => ({ ...prev, revisions: saved.revisions ?? prev.revisions }));
      setSaveState("saved");
      isDirty.current = false;
      setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2500);
    } catch { setSaveState("error"); }
  }, []);

  useEffect(() => {
    if (!isDirty.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { if (isDirty.current) save(post); }, 1500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [post, save]);

  const moveToTrash = async () => {
    if (!confirm("Move this post to trash?")) return;
    await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
    router.push("/admin/blog");
  };

  const restoreRevision = (rev: Revision) => {
    if (!confirm("Restore this revision? Current content will be overwritten.")) return;
    setPost((p) => ({ ...p, title: rev.title, excerpt: rev.excerpt, body: rev.body }));
    isDirty.current = true;
  };

  const loadMedia = async () => {
    setMediaLoading(true);
    setImageError("");
    try {
      const res = await fetch("/api/admin/blog/media", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load media");
      setMediaItems(data.images ?? []);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Failed to load media");
    } finally {
      setMediaLoading(false);
    }
  };

  const toggleMedia = async () => {
    const nextOpen = !mediaOpen;
    setMediaOpen(nextOpen);
    if (nextOpen && mediaItems.length === 0) await loadMedia();
  };

  const uploadCoverImage = async (file: File | null) => {
    if (!file) return;
    setImageUploading(true);
    setImageError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/blog/media", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      set("coverImage", data.url);
      setMediaItems((items) => [
        {
          name: file.name,
          path: data.filename ?? file.name,
          url: data.url,
          size: file.size,
          mimeType: file.type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...items,
      ]);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setImageUploading(false);
      if (coverUploadRef.current) coverUploadRef.current.value = "";
    }
  };

  const isPublished = post.status === "published";
  const inp = "w-full border border-brand-contrast/20 px-2 py-1.5 text-xs font-body bg-white focus:outline-none focus:border-brand-blue";

  return (
    <div className="min-h-screen bg-[#F8F9FC]">

      {/* ── WordPress-style top bar ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-brand-contrast/10 shadow-sm h-14 flex items-center px-4 gap-3">
        <button type="button" onClick={() => router.push("/admin/blog")}
          className="text-brand-contrast hover:text-brand-navy transition-colors p-1">
          <ArrowLeft size={18} />
        </button>

        <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast hidden sm:block">
          {post.postType === "glossary" ? "Glossary" : post.postType === "tutorial" ? "Tutorial" : "Blog Post"}
        </span>

        {/* Save state */}
        <div className="flex-1 flex items-center gap-2 ml-2">
          {saveState === "saving" && <span className="text-[10px] text-brand-contrast font-body flex items-center gap-1"><Loader2 size={11} className="animate-spin" />Saving…</span>}
          {saveState === "saved" && <span className="text-[10px] text-green-600 font-body flex items-center gap-1"><CheckCircle2 size={11} />Saved</span>}
          {saveState === "error" && <span className="text-[10px] text-red-500 font-body">Save failed</span>}
        </div>

        {/* Actions — right side */}
        <div className="flex items-center gap-2">
          {/* Save Draft — only when not published */}
          {!isPublished && (
            <button type="button" onClick={() => save({ ...post, status: "draft" })}
              className="px-3 py-1.5 text-[10px] font-heading font-bold uppercase tracking-widest border border-brand-contrast/25 text-brand-contrast hover:text-brand-navy hover:border-brand-contrast/50 transition-colors">
              Save Draft
            </button>
          )}

          {/* Preview */}
          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-heading font-bold uppercase tracking-widest border border-brand-contrast/25 text-brand-contrast hover:text-brand-navy transition-colors">
            <Eye size={11} />Preview
          </a>

          {/* Switch to Draft — only when published */}
          {isPublished && (
            <button type="button"
              onClick={() => { const updated = { ...post, status: "draft", published: false }; setPost(updated); save(updated); }}
              className="px-3 py-1.5 text-[10px] font-heading font-bold uppercase tracking-widest border border-brand-contrast/25 text-brand-contrast hover:text-brand-navy transition-colors">
              Switch to Draft
            </button>
          )}

          {/* Publish / Update */}
          <button type="button"
            onClick={() => {
              const updated = { ...post, status: "published" };
              setPost(updated);
              isDirty.current = false;
              save(updated);
            }}
            className="px-4 py-1.5 text-[10px] font-heading font-bold uppercase tracking-widest bg-brand-navy text-white hover:bg-brand-blue transition-colors">
            {isPublished ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {/* ── Body: editor + sidebar ── */}
      <div className="flex items-start">

        {/* Main editor column */}
        <div className="flex-1 min-w-0 px-6 md:px-12 py-8 max-w-3xl mx-auto w-full">

          {/* Title */}
          <div className="mb-2">
            <input
              type="text"
              value={post.title}
              onChange={(e) => { set("title", e.target.value); if (post.title === "Untitled Post" || !post.body) set("slug", slugify(e.target.value)); }}
              placeholder="Add title"
              className="w-full text-4xl font-heading font-bold text-brand-navy bg-transparent focus:outline-none placeholder:text-brand-contrast/25 border-b border-transparent focus:border-brand-contrast/20 pb-2 mb-1"
            />
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-brand-contrast font-body">Permalink:</span>
              <span className="text-[10px] text-brand-contrast font-body">/blog/</span>
              <input type="text" value={post.slug} onChange={(e) => set("slug", e.target.value)}
                className="text-[10px] font-mono text-brand-blue bg-transparent focus:outline-none border-b border-transparent focus:border-brand-blue" />
            </div>
          </div>

          {/* TipTap editor */}
          <div className="mt-4">
            <TipTapEditor content={post.body} onChange={(html) => set("body", html)} placeholder="Start writing your post…" />
          </div>

          {/* AI assistant */}
          <AiPanel post={post} onApply={(updates) => setPost((p) => ({ ...p, ...updates }))} />

          {/* ── Move to Trash — WordPress-style red link at bottom ── */}
          <div className="mt-10 pt-6 border-t border-brand-contrast/10">
            <button type="button" onClick={moveToTrash}
              className="text-xs font-body text-red-500 hover:text-red-700 hover:underline transition-colors">
              Move to Trash
            </button>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="w-72 shrink-0 border-l border-brand-contrast/10 bg-white self-start sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">

          {/* Publish panel — WordPress style */}
          <div className="border-b border-brand-contrast/10">
            <div className="px-4 py-3 bg-[#F8F9FC] border-b border-brand-contrast/10">
              <span className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy">Publish</span>
            </div>
            <div className="px-4 py-3 space-y-3">

              {/* Status row */}
              <div className="flex items-center justify-between text-xs font-body">
                <span className="text-brand-contrast">Status:</span>
                <select value={post.status} onChange={(e) => set("status", e.target.value)}
                  className="text-xs font-heading font-bold border border-brand-contrast/20 px-2 py-1 bg-white focus:outline-none focus:border-brand-blue text-brand-navy">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="trashed">Trashed</option>
                </select>
              </div>

              {/* Visibility */}
              <div className="flex items-center justify-between text-xs font-body">
                <span className="text-brand-contrast">Visibility:</span>
                <span className="text-brand-navy font-bold">Public</span>
              </div>

              {/* Post type */}
              <div className="flex items-center justify-between text-xs font-body">
                <span className="text-brand-contrast">Type:</span>
                <select value={post.postType} onChange={(e) => set("postType", e.target.value)}
                  className="text-xs font-heading font-bold border border-brand-contrast/20 px-2 py-1 bg-white focus:outline-none focus:border-brand-blue text-brand-navy">
                  <option value="blog">Blog</option>
                  <option value="glossary">Glossary</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>

              {/* Publish date */}
              <div>
                <label className="block text-[10px] text-brand-contrast font-body mb-1">
                  {isPublished ? "Published on:" : "Publish immediately"}
                </label>
                <input type="datetime-local" value={post.publishedAt ? post.publishedAt.slice(0, 16) : ""}
                  onChange={(e) => set("publishedAt", e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className={`${inp} text-[11px]`} />
              </div>

              {/* Reading time */}
              {post.readingTime && (
                <p className="text-[10px] text-brand-contrast font-body flex items-center gap-1">
                  <Clock size={10} />{post.readingTime} min read
                </p>
              )}

              {/* Featured */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={post.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)}
                  className="accent-brand-navy w-3.5 h-3.5" />
                <span className="flex items-center gap-1 text-xs font-body text-brand-navy">
                  <Star size={11} className="text-brand-accent" />Stick to top
                </span>
              </label>
            </div>
          </div>

          {/* Featured Image */}
          <Panel title="Featured Image" icon={<ImageIcon size={12} />}>
            <input type="url" value={post.coverImage} onChange={(e) => set("coverImage", e.target.value)}
              placeholder="https://..." className={inp} />
            <div className="grid grid-cols-2 gap-2">
              <input
                ref={coverUploadRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => uploadCoverImage(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => coverUploadRef.current?.click()}
                disabled={imageUploading}
                className="flex items-center justify-center gap-1.5 border border-brand-contrast/20 px-2 py-1.5 text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast hover:text-brand-navy hover:border-brand-navy transition-colors disabled:opacity-50"
              >
                {imageUploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                Upload
              </button>
              <button
                type="button"
                onClick={toggleMedia}
                className="flex items-center justify-center gap-1.5 border border-brand-contrast/20 px-2 py-1.5 text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast hover:text-brand-navy hover:border-brand-navy transition-colors"
              >
                <ImageIcon size={11} />
                Library
              </button>
            </div>
            {imageError && <p className="text-[10px] text-red-600 font-body">{imageError}</p>}
            {mediaOpen && (
              <div className="border border-brand-contrast/10 bg-[#F8F9FC] p-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-brand-navy">Media Library</p>
                  <button type="button" onClick={loadMedia} className="text-[10px] font-body text-brand-blue hover:underline">
                    Refresh
                  </button>
                </div>
                {mediaLoading ? (
                  <div className="py-8 flex items-center justify-center text-brand-contrast">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                ) : mediaItems.length ? (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {mediaItems.map((image) => (
                      <button
                        key={image.path}
                        type="button"
                        onClick={() => {
                          set("coverImage", image.url);
                          setMediaOpen(false);
                        }}
                        className={`aspect-square overflow-hidden border bg-white transition-colors ${post.coverImage === image.url ? "border-brand-blue ring-1 ring-brand-blue" : "border-brand-contrast/10 hover:border-brand-navy"}`}
                        title={image.path}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.url} alt={image.name} className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-[10px] text-brand-contrast font-body">No images found.</p>
                )}
              </div>
            )}
            {post.coverImage && (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.coverImage} alt="" className="w-full h-28 object-cover rounded" />
                <button type="button" onClick={() => set("coverImage", "")}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={10} />
                </button>
              </div>
            )}
          </Panel>

          {/* Author */}
          <Panel title="Author" defaultOpen={false}>
            {([
              { k: "authorName", l: "Name", p: "Author name" },
              { k: "authorAvatarUrl", l: "Avatar URL", p: "https://..." },
            ] as const).map(({ k, l, p }) => (
              <div key={k}>
                <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast mb-1">{l}</label>
                <input type="text" value={(post as unknown as Record<string, string>)[k] ?? ""} placeholder={p}
                  onChange={(e) => set(k, e.target.value as BlogPost[typeof k])} className={inp} />
              </div>
            ))}
            <div>
              <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast mb-1">Bio</label>
              <textarea rows={2} value={post.authorBio} onChange={(e) => set("authorBio", e.target.value)}
                className={`${inp} resize-none`} />
            </div>
          </Panel>

          {/* SEO */}
          <Panel title="SEO" icon={<SearchIcon size={12} />} defaultOpen={false}>
            <div>
              <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast mb-1">
                SEO Title <span className="normal-case font-normal">({post.seoTitle.length}/60)</span>
              </label>
              <input type="text" value={post.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} maxLength={70} className={inp} />
              <div className="h-0.5 mt-1 bg-brand-contrast/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${post.seoTitle.length > 60 ? "bg-red-400" : post.seoTitle.length > 40 ? "bg-green-400" : "bg-yellow-400"}`}
                  style={{ width: `${Math.min(100, (post.seoTitle.length / 60) * 100)}%` }} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast mb-1">
                Meta Description <span className="normal-case font-normal">({post.seoDescription.length}/160)</span>
              </label>
              <textarea rows={3} value={post.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} maxLength={180}
                className={`${inp} resize-none`} />
              <div className="h-0.5 mt-1 bg-brand-contrast/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${post.seoDescription.length > 160 ? "bg-red-400" : post.seoDescription.length > 100 ? "bg-green-400" : "bg-yellow-400"}`}
                  style={{ width: `${Math.min(100, (post.seoDescription.length / 160) * 100)}%` }} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast mb-1">Focus Keyword</label>
              <input type="text" value={post.focusKeyword} onChange={(e) => set("focusKeyword", e.target.value)}
                placeholder="e.g. hyaluronic acid serum" className={inp} />
            </div>
          </Panel>

          {/* Tags */}
          <Panel title="Tags" icon={<Tag size={12} />} defaultOpen={false}>
            <TagInput label="" values={post.tags} onChange={(v) => set("tags", v)} />
          </Panel>

          {/* Categories */}
          <Panel title="Categories" icon={<FolderOpen size={12} />} defaultOpen={false}>
            <TagInput label="" values={post.categories} onChange={(v) => set("categories", v)} />
          </Panel>

          {/* Excerpt */}
          <Panel title="Excerpt" defaultOpen={false}>
            <textarea rows={4} value={post.excerpt} onChange={(e) => set("excerpt", e.target.value)}
              placeholder="Short summary shown in listings…" className={`${inp} resize-none`} />
          </Panel>

          {/* Revisions */}
          {(post.revisions ?? []).length > 0 && (
            <Panel title="Revisions" icon={<RotateCcw size={12} />} defaultOpen={false}>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {(post.revisions ?? []).map((rev, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 text-[10px] font-body border-b border-brand-contrast/10 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-brand-navy truncate max-w-[130px]">{rev.title || "Untitled"}</p>
                      <p className="text-brand-contrast">{new Date(rev.timestamp).toLocaleString("en-AU", { dateStyle: "short", timeStyle: "short" })}</p>
                    </div>
                    <button type="button" onClick={() => restoreRevision(rev)}
                      className="text-brand-blue hover:text-brand-navy shrink-0 flex items-center gap-0.5">
                      <RotateCcw size={10} />Restore
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
