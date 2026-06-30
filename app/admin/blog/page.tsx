"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Search, ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

interface BlogRow {
  id: string; title: string; slug: string; status: string;
  postType: string; authorName: string | null;
  publishedAt: string | null; isFeatured: boolean; readingTime: number | null;
}
interface ListData {
  posts: BlogRow[]; total: number;
  counts: { all: number; published: number; draft: number; trashed: number };
}

const TABS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "trashed", label: "Trash" },
] as const;

const TYPE_COLORS: Record<string, string> = {
  blog: "bg-blue-100 text-blue-700",
  glossary: "bg-purple-100 text-purple-700",
  tutorial: "bg-orange-100 text-orange-700",
};
const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  trashed: "bg-red-100 text-red-600",
};

export default function AdminBlogPage() {
  const [tab, setTab] = useState<"all" | "published" | "draft" | "trashed">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickEdit, setQuickEdit] = useState<string | null>(null);
  const [qeData, setQeData] = useState({ title: "", slug: "", status: "draft", publishedAt: "" });
  const [qeSaving, setQeSaving] = useState(false);
  const PER_PAGE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ list: "true", page: String(page), perPage: String(PER_PAGE) });
    if (tab !== "all") p.set("status", tab);
    if (search) p.set("search", search);
    try { const res = await fetch(`/api/admin/blog?${p}`); setData(await res.json()); }
    catch { setData(null); } finally { setLoading(false); }
  }, [tab, search, page]);

  useEffect(() => { load(); }, [load]);

  const openQE = (post: BlogRow) => {
    setQuickEdit(post.id);
    setQeData({ title: post.title, slug: post.slug, status: post.status, publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : "" });
  };

  const saveQE = async () => {
    if (!quickEdit) return;
    setQeSaving(true);
    await fetch(`/api/admin/blog/${quickEdit}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...qeData, published: qeData.status === "published", publishedAt: qeData.publishedAt ? new Date(qeData.publishedAt).toISOString() : null }),
    });
    setQeSaving(false); setQuickEdit(null); load();
  };

  const trashPost = async (id: string) => {
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    load();
  };

  const restorePost = async (id: string) => {
    await fetch(`/api/admin/blog/${id}`, { method: "PATCH" });
    load();
  };

  const deleteForever = async (id: string) => {
    if (!confirm("Permanently delete this post? This cannot be undone.")) return;
    await fetch(`/api/admin/blog/${id}?permanent=true`, { method: "DELETE" });
    load();
  };

  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 1;
  const inp = "w-full border border-brand-contrast/20 px-2 py-1.5 text-xs font-body bg-white focus:outline-none focus:border-brand-blue";

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-brand-navy">Blog Posts</h1>
          <Link href="/admin/blog/new"
            className="flex items-center gap-2 bg-brand-accent text-brand-navy rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors">
            <Plus size={14} />Add New
          </Link>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-0 border-b border-brand-contrast/10 mb-4">
          {TABS.map((t) => {
            const count = data?.counts[t.key as keyof typeof data.counts] ?? 0;
            return (
              <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
                className={`px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-colors ${tab === t.key ? "border-brand-navy text-brand-navy" : "border-transparent text-brand-contrast hover:text-brand-navy"}`}>
                {t.label}
                {data && (
                  <span className={`ml-1.5 px-1.5 py-0.5 text-[9px] rounded-full ${t.key === "trashed" && count > 0 ? "bg-red-100 text-red-600" : "bg-brand-contrast/10 text-brand-contrast"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-contrast" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search posts…"
              className="w-full pl-9 pr-3 py-2 border border-brand-contrast/20 text-sm font-body bg-white focus:outline-none focus:border-brand-blue" />
          </div>
          {search && <button onClick={() => setSearch("")} className="text-brand-contrast hover:text-brand-navy"><X size={14} /></button>}
        </div>

        {/* Table */}
        <div className="bg-white border border-brand-contrast/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                {["Title", "Type", "Author", "Date", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-contrast/10">
              {loading && <tr><td colSpan={6} className="px-6 py-10 text-center text-brand-contrast">Loading…</td></tr>}
              {!loading && !data?.posts.length && <tr><td colSpan={6} className="px-6 py-10 text-center text-brand-contrast">No posts found.</td></tr>}
              {!loading && data?.posts.map((post) => (
                <Fragment key={post.id}>
                  <tr key={post.id} className={`group hover:bg-[#F8F9FC] transition-colors ${quickEdit === post.id ? "bg-blue-50" : ""}`}>

                    {/* Title cell — WordPress hover actions appear here */}
                    <td className="px-5 py-3">
                      <div className="flex items-start gap-2">
                        {post.isFeatured && <span className="text-brand-accent mt-0.5">★</span>}
                        <div>
                          <p className="font-bold text-brand-navy max-w-xs truncate">{post.title}</p>
                          <p className="font-mono text-[10px] text-brand-contrast">{post.slug}</p>

                          {/* Hover row actions — WordPress style */}
                          <div className="hidden group-hover:flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <Link href={`/admin/blog/${post.id}`}
                              className="text-[10px] font-body text-brand-blue hover:underline">
                              Edit
                            </Link>
                            <span className="text-brand-contrast/30 text-[10px]">|</span>
                            <button
                              onClick={() => quickEdit === post.id ? setQuickEdit(null) : openQE(post)}
                              className="text-[10px] font-body text-brand-blue hover:underline">
                              {quickEdit === post.id ? "Cancel" : "Quick Edit"}
                            </button>
                            <span className="text-brand-contrast/30 text-[10px]">|</span>

                            {post.status === "trashed" ? (
                              <>
                                <button onClick={() => restorePost(post.id)}
                                  className="text-[10px] font-body text-green-600 hover:underline">
                                  Restore
                                </button>
                                <span className="text-brand-contrast/30 text-[10px]">|</span>
                                <button onClick={() => deleteForever(post.id)}
                                  className="text-[10px] font-body text-red-500 hover:underline">
                                  Delete Permanently
                                </button>
                              </>
                            ) : (
                              <button onClick={() => trashPost(post.id)}
                                className="text-[10px] font-body text-red-500 hover:underline">
                                Trash
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider rounded-full ${TYPE_COLORS[post.postType] ?? "bg-gray-100 text-gray-600"}`}>
                        {post.postType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-contrast text-xs">{post.authorName ?? "—"}</td>
                    <td className="px-5 py-3 text-brand-contrast whitespace-nowrap text-xs">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-AU") : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider ${STATUS_COLORS[post.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {post.status}
                      </span>
                    </td>

                    {/* Actions column — just pencil icon for full edit */}
                    <td className="px-5 py-3">
                      <Link href={`/admin/blog/${post.id}`} className="text-brand-contrast/40 hover:text-brand-navy transition-colors opacity-0 group-hover:opacity-100">
                        <Pencil size={14} />
                      </Link>
                    </td>
                  </tr>

                  {/* Quick Edit inline panel */}
                  {quickEdit === post.id && (
                    <tr key={`qe-${post.id}`} className="bg-blue-50">
                      <td colSpan={6} className="px-5 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-navy mb-1">Title</label>
                            <input value={qeData.title} onChange={(e) => setQeData((d) => ({ ...d, title: e.target.value }))} className={inp} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-navy mb-1">Slug</label>
                            <input value={qeData.slug} onChange={(e) => setQeData((d) => ({ ...d, slug: e.target.value }))} className={`${inp} font-mono`} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-navy mb-1">Status</label>
                            <select value={qeData.status} onChange={(e) => setQeData((d) => ({ ...d, status: e.target.value }))} className={inp}>
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="trashed">Trashed</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-navy mb-1">Publish Date</label>
                            <input type="datetime-local" value={qeData.publishedAt} onChange={(e) => setQeData((d) => ({ ...d, publishedAt: e.target.value }))} className={inp} />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={saveQE} disabled={qeSaving}
                            className="flex items-center gap-1.5 bg-brand-navy text-white px-3 py-1.5 text-[10px] font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50">
                            <Check size={11} />{qeSaving ? "Saving…" : "Update"}
                          </button>
                          <button onClick={() => setQuickEdit(null)}
                            className="flex items-center gap-1.5 border border-brand-contrast/20 text-brand-contrast px-3 py-1.5 text-[10px] font-heading font-bold uppercase tracking-widest hover:text-brand-navy transition-colors">
                            <X size={11} />Cancel
                          </button>
                          <Link href={`/admin/blog/${post.id}`}
                            className="flex items-center gap-1.5 border border-brand-blue text-brand-blue px-3 py-1.5 text-[10px] font-heading font-bold uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-colors">
                            <Pencil size={11} />Full Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-brand-contrast font-body">{data?.total} posts · Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 border border-brand-contrast/20 hover:bg-[#F8F9FC] disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 border border-brand-contrast/20 hover:bg-[#F8F9FC] disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
