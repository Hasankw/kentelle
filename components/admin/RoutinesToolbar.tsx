"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Sparkles, X, Copy, Check } from "lucide-react";

interface Props {
  tableExists: boolean;
  hasRoutines: boolean;
}

export default function RoutinesToolbar({ tableExists, hasRoutines }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [sql, setSql] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const setupTable = async () => {
    setLoading("setup");
    const res = await fetch("/api/admin/routines/migrate", { method: "POST" });
    const data = await res.json();
    if (data.needsManual) {
      setSql(data.sql);
    } else if (data.ok) {
      router.refresh();
    } else {
      alert(data.message ?? "Setup failed");
    }
    setLoading(null);
  };

  const seedRoutines = async () => {
    if (!confirm("Seed all 6 routines from the Kentelle PDFs? Existing slugs will be skipped.")) return;
    setLoading("seed");
    const res = await fetch("/api/admin/routines/seed", { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      const created = data.results?.filter((r: any) => r.status === "created").length ?? 0;
      const skipped = data.results?.filter((r: any) => r.status === "skipped").length ?? 0;
      alert(`Done! ${created} created, ${skipped} skipped.`);
      router.refresh();
    } else {
      alert(data.error ?? "Seed failed");
    }
    setLoading(null);
  };

  const copySQL = () => {
    if (!sql) return;
    navigator.clipboard.writeText(sql).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {!tableExists && (
        <button
          onClick={setupTable}
          disabled={loading === "setup"}
          className="flex items-center gap-2 border border-brand-contrast/20 text-brand-contrast rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-[#F8F9FC] transition-colors disabled:opacity-50"
        >
          <Database size={13} />
          {loading === "setup" ? "Setting up..." : "Setup Table"}
        </button>
      )}

      {tableExists && !hasRoutines && (
        <button
          onClick={seedRoutines}
          disabled={loading === "seed"}
          className="flex items-center gap-2 border border-brand-blue text-brand-blue rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue/5 transition-colors disabled:opacity-50"
        >
          <Sparkles size={13} />
          {loading === "seed" ? "Seeding..." : "Seed 6 Routines"}
        </button>
      )}

      {/* SQL Modal */}
      {sql && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white max-w-2xl w-full shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-contrast/10">
              <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy">
                Run in Supabase SQL Editor
              </h2>
              <button onClick={() => setSql(null)} className="text-brand-contrast hover:text-brand-navy">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm font-body text-brand-contrast mb-4">
                Direct DB connection is unavailable on this network. Copy the SQL below and run it in your{" "}
                <span className="font-bold text-brand-navy">Supabase Dashboard → SQL Editor</span>.
              </p>
              <div className="relative">
                <pre className="bg-[#F8F9FC] border border-brand-contrast/10 p-4 text-xs font-mono text-brand-navy overflow-x-auto whitespace-pre-wrap">
                  {sql}
                </pre>
                <button
                  onClick={copySQL}
                  className="absolute top-2 right-2 flex items-center gap-1.5 bg-white border border-brand-contrast/20 px-3 py-1.5 text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast hover:text-brand-navy transition-colors"
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs font-body text-brand-contrast mt-3">
                After running the SQL, refresh this page and click "Seed 6 Routines".
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
