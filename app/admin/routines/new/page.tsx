import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import RoutineForm from "@/components/admin/RoutineForm";

export const metadata: Metadata = { title: "New Routine" };

export default function AdminRoutineNewPage() {
  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/routines" className="text-brand-contrast hover:text-brand-navy transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-heading font-bold text-2xl text-brand-navy">New Routine</h1>
        </div>
        <div className="bg-white border border-brand-contrast/10 shadow-sm p-6">
          <RoutineForm />
        </div>
      </div>
    </AdminShell>
  );
}
