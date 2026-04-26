import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import BlogForm from "@/components/admin/BlogForm";

export const metadata: Metadata = { title: "New Blog Post" };

export default function AdminBlogNewPage() {
  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/blog" className="text-brand-contrast hover:text-brand-navy transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-heading font-bold text-2xl text-brand-navy">
            New Blog Post
          </h1>
        </div>
        <div className="bg-white border border-brand-contrast/10 shadow-sm p-6">
          <BlogForm />
        </div>
      </div>
    </AdminShell>
  );
}
