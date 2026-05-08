export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import RoutinesToolbar from "@/components/admin/RoutinesToolbar";

export const metadata: Metadata = { title: "Routines" };

export default async function AdminRoutinesPage() {
  let routines: any[] = [];
  let tableExists = true;

  try {
    routines = (await db.routine.findMany({ orderBy: { sortOrder: "asc" } })) as any[];
  } catch {
    tableExists = false;
  }

  const skincare = routines.filter((r: any) => r.category === "routine");
  const clinical = routines.filter((r: any) => r.category === "clinical");

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-brand-navy">
            Routines {routines.length > 0 && `(${routines.length})`}
          </h1>
          <div className="flex gap-3">
            <RoutinesToolbar tableExists={tableExists} hasRoutines={routines.length > 0} />
            <Link
              href="/admin/routines/new"
              className="flex items-center gap-2 bg-brand-accent text-brand-navy rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors"
            >
              <Plus size={14} /> New Routine
            </Link>
          </div>
        </div>

        {!tableExists && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-5 mb-8 text-sm font-body text-yellow-800">
            <strong className="font-heading font-bold uppercase tracking-wider text-xs">Table not set up yet.</strong>
            <p className="mt-1">Click "Setup Table" to create the Routine database table, or run the SQL manually in your Supabase SQL Editor.</p>
          </div>
        )}

        {[
          { label: "Skincare Routines", items: skincare },
          { label: "Clinical Treatments", items: clinical },
        ].map(({ label, items }) => (
          <div key={label} className="mb-8">
            <h2 className="text-xs font-heading font-bold uppercase tracking-widest text-brand-contrast mb-3">{label}</h2>
            <div className="bg-white border border-brand-contrast/10 shadow-sm overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                    {["Title", "Slug", "Steps", "Status", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-contrast/10">
                  {items.map((r: any) => (
                    <tr key={r.id} className="hover:bg-[#F8F9FC] transition-colors">
                      <td className="px-5 py-3 font-bold text-brand-navy">{r.title}</td>
                      <td className="px-5 py-3 font-mono text-xs text-brand-contrast">{r.slug}</td>
                      <td className="px-5 py-3 text-brand-contrast">{Array.isArray(r.steps) ? r.steps.length : 0} steps</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider ${r.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {r.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/admin/routines/${r.id}`} className="text-brand-blue hover:text-brand-navy transition-colors">
                          <Pencil size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-brand-contrast/50 text-sm">
                        No {label.toLowerCase()} yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
