export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import RoutineForm from "@/components/admin/RoutineForm";

export const metadata: Metadata = { title: "Edit Routine" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRoutineEditPage({ params }: PageProps) {
  const { id } = await params;
  const routine = await db.routine.findUnique({ where: { id } });
  if (!routine) notFound();

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/routines" className="text-brand-contrast hover:text-brand-navy transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-heading font-bold text-2xl text-brand-navy">Edit Routine</h1>
        </div>
        <div className="bg-white border border-brand-contrast/10 shadow-sm p-6">
          <RoutineForm
            routine={{
              id: (routine as any).id,
              title: (routine as any).title,
              slug: (routine as any).slug,
              tagline: (routine as any).tagline ?? "",
              category: (routine as any).category,
              sortOrder: (routine as any).sortOrder ?? 0,
              published: (routine as any).published,
              steps: (routine as any).steps ?? [],
              tips: (routine as any).tips ?? { suitability: "", items: [] },
            }}
          />
        </div>
      </div>
    </AdminShell>
  );
}
