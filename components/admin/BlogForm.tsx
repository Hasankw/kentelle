"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  published: boolean;
}

export default function BlogForm({ post }: { post?: Partial<BlogPost> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<BlogPost>({
    id: post?.id,
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    body: post?.body ?? "",
    coverImage: post?.coverImage ?? "",
    published: post?.published ?? false,
  });

  const set = (key: keyof BlogPost, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleTitleChange = (v: string) => {
    set("title", v);
    if (!post?.id) set("slug", slugify(v));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const url = form.id ? `/api/admin/blog/${form.id}` : "/api/admin/blog";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) router.push("/admin/blog");
    });
  };

  const handleDelete = () => {
    if (!form.id || !confirm("Delete this post?")) return;
    startTransition(async () => {
      await fetch(`/api/admin/blog/${form.id}`, { method: "DELETE" });
      router.push("/admin/blog");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
            Title *
          </label>
          <input
            required
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue"
          />
        </div>
        <div>
          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
            Slug *
          </label>
          <input
            required
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            className="w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body font-mono text-brand-navy bg-white focus:outline-none focus:border-brand-blue"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Excerpt
        </label>
        <textarea
          rows={2}
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          className="w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Body *
        </label>
        <textarea
          required
          rows={16}
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          className="w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Cover Image URL
        </label>
        <input
          value={form.coverImage}
          onChange={(e) => set("coverImage", e.target.value)}
          placeholder="https://..."
          className="w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          checked={form.published}
          onChange={(e) => set("published", e.target.checked)}
          className="accent-brand-blue w-4 h-4"
        />
        <label htmlFor="published" className="text-sm font-body text-brand-navy">
          Published
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-brand-navy text-brand-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : form.id ? "Update Post" : "Create Post"}
        </button>
        {form.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-6 py-2.5 border border-red-200 text-red-600 text-xs font-heading font-bold uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
