export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function AdminBlogNewPage() {
  const post = await db.blog.create({
    data: {
      title: "Untitled Post",
      slug: `untitled-${Date.now()}`,
      body: "",
      status: "draft",
      postType: "blog",
      published: false,
      revisions: [],
      tags: [],
      categories: [],
    },
  });
  redirect(`/admin/blog/${post.id}`);
}
