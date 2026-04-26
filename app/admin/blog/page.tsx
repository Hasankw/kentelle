export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  const posts = await db.blog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-brand-navy">
            Blog ({posts.length})
          </h1>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 bg-brand-navy text-brand-white px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors"
          >
            <Plus size={14} />
            New Post
          </Link>
        </div>

        <div className="bg-white border border-brand-contrast/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                {["Title", "Slug", "Status", "Published", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-contrast/10">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-[#F8F9FC] transition-colors">
                  <td className="px-5 py-3 font-bold text-brand-navy max-w-xs truncate">{post.title}</td>
                  <td className="px-5 py-3 font-mono text-xs text-brand-contrast">{post.slug}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider ${
                      post.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-brand-contrast whitespace-nowrap">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-AU") : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/blog/${post.id}`} className="text-brand-blue hover:text-brand-navy transition-colors">
                      <Pencil size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-brand-contrast">
                    No blog posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
