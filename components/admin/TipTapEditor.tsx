"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useRef, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, Minus, Code, Upload, X, Loader2,
} from "lucide-react";

/* ─── Toolbar helpers ─────────────────────────────────────────────────── */
function Btn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title}
      className={`p-1.5 rounded text-sm transition-colors ${
        active ? "bg-brand-navy text-white" : "text-brand-contrast hover:bg-brand-contrast/10 hover:text-brand-navy"
      } disabled:opacity-30 disabled:cursor-not-allowed`}>
      {children}
    </button>
  );
}
function Sep() { return <span className="w-px h-5 bg-brand-contrast/20 mx-0.5" />; }

/* ─── Media modal ─────────────────────────────────────────────────────── */
interface MediaItem {
  name: string;
  path: string;
  url: string;
}

function MediaModal({ onInsert, onClose }: { onInsert: (url: string, alt?: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"upload" | "library" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [altInput, setAltInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/blog/media", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onInsert(data.url, altInput || file.name.replace(/\.[^.]+$/, ""));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const loadLibrary = useCallback(async () => {
    setLibraryLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog/media", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load media");
      setLibrary(data.images ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load media");
    } finally {
      setLibraryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "library" && library.length === 0) {
      loadLibrary();
    }
  }, [tab, library.length, loadLibrary]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full max-w-lg shadow-2xl border border-brand-contrast/10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-contrast/10 bg-[#F8F9FC]">
          <h2 className="text-sm font-heading font-bold uppercase tracking-widest text-brand-navy">Insert Media</h2>
          <button type="button" onClick={onClose} className="text-brand-contrast hover:text-brand-navy"><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-brand-contrast/10">
          {(["upload", "library", "url"] as const).map((t) => (
            <button key={t} type="button" onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-2.5 text-xs font-heading font-bold uppercase tracking-wider transition-colors ${tab === t ? "border-b-2 border-brand-navy text-brand-navy bg-white" : "text-brand-contrast hover:text-brand-navy"}`}>
              {t === "upload" ? "Upload File" : t === "library" ? "Media Library" : "Insert from URL"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {tab === "upload" && (
            <>
              {/* Drop zone */}
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 min-h-[140px] ${dragOver ? "border-brand-navy bg-brand-navy/5" : "border-brand-contrast/25 hover:border-brand-navy/40 hover:bg-brand-contrast/3"}`}
              >
                {preview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={preview} alt="" className="max-h-36 object-contain rounded" />
                ) : (
                  <>
                    <Upload size={28} className="text-brand-contrast/40" />
                    <div className="text-center">
                      <p className="text-sm font-body text-brand-navy font-medium">Drop image here or click to browse</p>
                      <p className="text-xs text-brand-contrast mt-1">JPG, PNG, WebP, GIF, AVIF · max 10 MB</p>
                    </div>
                  </>
                )}
              </div>
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {/* Alt text */}
              <div>
                <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast mb-1">Alt Text</label>
                <input type="text" value={altInput} onChange={(e) => setAltInput(e.target.value)} placeholder="Describe the image for accessibility"
                  className="w-full border border-brand-contrast/20 px-3 py-2 text-xs font-body bg-white focus:outline-none focus:border-brand-blue" />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-heading font-bold uppercase tracking-widest border border-brand-contrast/20 text-brand-contrast hover:text-brand-navy transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={upload} disabled={!file || uploading}
                  className="px-5 py-2 text-xs font-heading font-bold uppercase tracking-widest bg-brand-navy text-white hover:bg-brand-blue transition-colors disabled:opacity-50 flex items-center gap-2">
                  {uploading ? <><Loader2 size={11} className="animate-spin" />Uploading…</> : "Insert"}
                </button>
              </div>
            </>
          )}

          {tab === "library" && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-body text-brand-contrast">{library.length} images available</p>
                <button type="button" onClick={loadLibrary} className="text-xs font-body text-brand-blue hover:underline">Refresh</button>
              </div>
              {libraryLoading ? (
                <div className="py-16 flex items-center justify-center text-brand-contrast">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              ) : library.length ? (
                <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                  {library.map((image) => (
                    <button
                      key={image.path}
                      type="button"
                      onClick={() => onInsert(image.url, image.name.replace(/\.[^.]+$/, ""))}
                      className="aspect-square overflow-hidden border border-brand-contrast/10 bg-[#F8F9FC] hover:border-brand-navy transition-colors"
                      title={image.path}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.url} alt={image.name} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-12 text-center text-xs font-body text-brand-contrast">No images found.</p>
              )}
              {error && <p className="text-xs text-red-500">{error}</p>}
            </>
          )}

          {tab === "url" && (
            <>
              <div>
                <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast mb-1">Image URL</label>
                <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg" autoFocus
                  className="w-full border border-brand-contrast/20 px-3 py-2 text-xs font-body bg-white focus:outline-none focus:border-brand-blue" />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast mb-1">Alt Text</label>
                <input type="text" value={altInput} onChange={(e) => setAltInput(e.target.value)} placeholder="Describe the image for accessibility"
                  className="w-full border border-brand-contrast/20 px-3 py-2 text-xs font-body bg-white focus:outline-none focus:border-brand-blue" />
              </div>
              {/* URL Preview */}
              {urlInput && (
                <div className="border border-brand-contrast/10 p-2 bg-[#F8F9FC] flex items-center justify-center min-h-[80px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urlInput} alt={altInput} className="max-h-40 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-heading font-bold uppercase tracking-widest border border-brand-contrast/20 text-brand-contrast hover:text-brand-navy transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={() => { if (!urlInput.trim()) { setError("Please enter a URL"); return; } onInsert(urlInput.trim(), altInput); }}
                  className="px-5 py-2 text-xs font-heading font-bold uppercase tracking-widest bg-brand-navy text-white hover:bg-brand-blue transition-colors">
                  Insert
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main editor ─────────────────────────────────────────────────────── */
export default function TipTapEditor({ content, onChange, placeholder }: {
  content: string; onChange: (html: string) => void; placeholder?: string;
}) {
  const [showMedia, setShowMedia] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: true, HTMLAttributes: { class: "rounded-xl max-w-full my-4" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-brand-blue underline" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing your post…" }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[500px] focus:outline-none px-8 py-6 font-body text-brand-navy leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertImage = useCallback((url: string, alt?: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: url, alt: alt ?? "" }).run();
    setShowMedia(false);
  }, [editor]);

  if (!editor) return null;

  return (
    <>
      {showMedia && <MediaModal onInsert={insertImage} onClose={() => setShowMedia(false)} />}

      <div className="border border-brand-contrast/15 bg-white flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-brand-contrast/10 bg-[#F8F9FC] sticky top-0 z-10">
          <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><UnderlineIcon size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><Strikethrough size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code"><Code size={14} /></Btn>
          <Sep />
          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1"><Heading1 size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3"><Heading3 size={14} /></Btn>
          <Sep />
          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><List size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list"><ListOrdered size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote"><Quote size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={14} /></Btn>
          <Sep />
          <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left"><AlignLeft size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center"><AlignCenter size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right"><AlignRight size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify"><AlignJustify size={14} /></Btn>
          <Sep />
          <Btn onClick={setLink} active={editor.isActive("link")} title="Insert link"><LinkIcon size={14} /></Btn>

          {/* Media button — opens modal instead of prompt */}
          <Btn onClick={() => setShowMedia(true)} title="Insert media">
            <ImageIcon size={14} />
          </Btn>
          <Sep />
          <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo size={14} /></Btn>
        </div>

        <EditorContent editor={editor} />
      </div>
    </>
  );
}
