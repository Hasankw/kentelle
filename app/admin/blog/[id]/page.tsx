export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import BlogForm from "@/components/admin/BlogForm";

export const metadata: Metadata = { title: "Edit Blog Post" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminBlogEditPage({ params }: PageProps) {
  const { id } = await params;
  const post = await db.blog.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/blog" className="text-brand-contrast hover:text-brand-navy transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-heading font-bold text-2xl text-brand-navy">
            Edit Post
          </h1>
        </div>
        <div className="bg-white border border-brand-contrast/10 shadow-sm p-6">
          <BlogForm
            post={{
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt ?? "",
              body: post.body,
              coverImage: post.coverImage ?? "",
              published: post.published,
            }}
          />
        </div>
      </div>
    </AdminShell>
  );
}
