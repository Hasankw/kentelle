"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

interface FooterLink { id: string; label: string; href: string; enabled: boolean; }
interface FooterColumn { id: string; title: string; links: FooterLink[]; }

const DEFAULTS: FooterColumn[] = [
  {
    id: "col1", title: "Shop", links: [
      { id: "l1", label: "All Products", href: "/shop", enabled: true },
      { id: "l2", label: "Collections", href: "/collections", enabled: true },
      { id: "l3", label: "Face Wash", href: "/shop", enabled: true },
      { id: "l4", label: "Moisturisers", href: "/shop", enabled: true },
      { id: "l5", label: "Serums", href: "/shop", enabled: true },
      { id: "l6", label: "Eye Care", href: "/shop", enabled: true },
    ],
  },
  {
    id: "col2", title: "Help", links: [
      { id: "l7", label: "Find Your Routine", href: "/find-your-routine", enabled: true },
      { id: "l8", label: "Skin Regimen", href: "/skin-regimen", enabled: true },
      { id: "l9", label: "FAQ", href: "/faq", enabled: true },
      { id: "l10", label: "Contact Us", href: "/contact", enabled: true },
      { id: "l11", label: "About Kentelle", href: "/about", enabled: true },
      { id: "l12", label: "Blog", href: "/blog", enabled: true },
      { id: "l13", label: "Reviews", href: "/reviews", enabled: true },
    ],
  },
  {
    id: "col3", title: "Account", links: [
      { id: "l14", label: "My Account", href: "/account", enabled: true },
      { id: "l15", label: "Track Order", href: "/account/orders", enabled: true },
      { id: "l16", label: "Gift Cards", href: "/gift-cards", enabled: true },
      { id: "l17", label: "Returns & Refunds", href: "/faq#returns", enabled: true },
    ],
  },
];

export default function FooterAdminPage() {
  const [columns, setColumns] = useState<FooterColumn[]>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages/content?key=nav_footer")
      .then((r) => r.json())
      .then((d) => { if (d.value) setColumns(JSON.parse(d.value)); });
  }, []);

  const save = async (cols: FooterColumn[] = columns) => {
    setSaving(true);
    await fetch("/api/admin/pages/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "nav_footer", value: JSON.stringify(cols) }),
    });
    setSaving(false);
    setStatus("Saved!");
    setTimeout(() => setStatus(null), 2000);
  };

  const updateColTitle = (colId: string, title: string) =>
    setColumns((prev) => prev.map((c) => c.id === colId ? { ...c, title } : c));

  const updateLink = (colId: string, linkId: string, field: keyof FooterLink, val: string | boolean) =>
    setColumns((prev) => prev.map((c) => c.id === colId
      ? { ...c, links: c.links.map((l) => l.id === linkId ? { ...l, [field]: val } : l) }
      : c
    ));

  const moveLink = (colId: string, linkId: string, dir: -1 | 1) => {
    setColumns((prev) => prev.map((c) => {
      if (c.id !== colId) return c;
      const idx = c.links.findIndex((l) => l.id === linkId);
      if (idx + dir < 0 || idx + dir >= c.links.length) return c;
      const next = [...c.links];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return { ...c, links: next };
    }));
  };

  const removeLink = (colId: string, linkId: string) => {
    if (!confirm("Delete this link?")) return;
    const next = columns.map((c) => c.id === colId ? { ...c, links: c.links.filter((l) => l.id !== linkId) } : c);
    setColumns(next); save(next);
  };

  const addLink = (colId: string) => {
    const newId = crypto.randomUUID();
    setColumns((prev) => prev.map((c) => c.id === colId
      ? { ...c, links: [...c.links, { id: newId, label: "New Link", href: "/", enabled: true }] }
      : c
    ));
    setEditingLink(newId);
  };

  const addColumn = () => {
    const newCol: FooterColumn = { id: crypto.randomUUID(), title: "New Column", links: [] };
    setColumns((prev) => [...prev, newCol]);
  };

  const removeColumn = (colId: string) => {
    if (!confirm("Delete this entire column?")) return;
    const next = columns.filter((c) => c.id !== colId);
    setColumns(next); save(next);
  };

  const inputCls = "w-full border border-brand-contrast/20 px-3 py-2 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/appearance" className="text-brand-contrast hover:text-brand-navy"><ArrowLeft size={18} /></Link>
            <div>
              <h1 className="font-heading font-bold text-2xl text-brand-navy">Footer</h1>
              <p className="text-xs font-body text-brand-contrast mt-0.5">{columns.length} columns</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status && <span className="text-xs font-heading font-bold text-green-600 uppercase tracking-wider">{status}</span>}
            <button onClick={addColumn} className="flex items-center gap-2 border border-brand-contrast/20 text-brand-contrast rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-[#F8F9FC] transition-colors">
              <Plus size={14} /> Add Column
            </button>
            <button onClick={() => save()} disabled={saving} className="bg-brand-navy text-brand-white rounded px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50">
              {saving ? "Saving…" : "Save All"}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {columns.map((col) => (
            <div key={col.id} className="bg-white border border-brand-contrast/10 shadow-sm">
              {/* Column header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-brand-contrast/10 bg-[#F8F9FC]">
                <input
                  value={col.title}
                  onChange={(e) => updateColTitle(col.id, e.target.value)}
                  className="flex-1 border border-brand-contrast/20 px-2 py-1 text-xs font-heading font-bold uppercase tracking-wider text-brand-navy bg-white focus:outline-none focus:border-brand-blue"
                />
                <button onClick={() => removeColumn(col.id)} className="text-red-400 hover:text-red-600 transition-colors shrink-0"><Trash2 size={14} /></button>
              </div>

              {/* Links */}
              <div className="divide-y divide-brand-contrast/5">
                {col.links.map((link, li) => (
                  <div key={link.id} className={`${!link.enabled ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-2 px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveLink(col.id, link.id, -1)} disabled={li === 0} className="text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20"><ChevronUp size={11} /></button>
                        <button onClick={() => moveLink(col.id, link.id, 1)} disabled={li === col.links.length - 1} className="text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20"><ChevronDown size={11} /></button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-body font-semibold text-brand-navy truncate">{link.label}</p>
                        <p className="text-[10px] font-body text-brand-contrast/60 truncate">{link.href}</p>
                      </div>
                      <button
                        onClick={() => updateLink(col.id, link.id, "enabled", !link.enabled)}
                        className={`${link.enabled ? "text-green-600" : "text-brand-contrast/40"} hover:text-brand-navy transition-colors`}
                      >
                        {link.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <button onClick={() => setEditingLink(editingLink === link.id ? null : link.id)} className="text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-1 border border-brand-contrast/20 text-brand-contrast hover:text-brand-navy transition-colors">
                        {editingLink === link.id ? "×" : "Edit"}
                      </button>
                      <button onClick={() => removeLink(col.id, link.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={12} /></button>
                    </div>

                    {editingLink === link.id && (
                      <div className="px-4 pb-3 bg-[#F8F9FC] border-t border-brand-contrast/5 space-y-2 pt-3">
                        <div>
                          <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">Label</label>
                          <input value={link.label} onChange={(e) => updateLink(col.id, link.id, "label", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">URL</label>
                          <input value={link.href} onChange={(e) => updateLink(col.id, link.id, "href", e.target.value)} className={inputCls} />
                        </div>
                        <button onClick={() => { setEditingLink(null); save(); }} className="px-4 py-1.5 bg-brand-navy text-brand-white rounded text-[10px] font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors">Save</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add link */}
              <div className="px-4 py-3 border-t border-brand-contrast/10">
                <button onClick={() => addLink(col.id)} className="text-[10px] font-heading font-bold uppercase tracking-wider text-brand-blue hover:text-brand-navy transition-colors flex items-center gap-1">
                  <Plus size={11} /> Add Link
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs font-body text-brand-contrast mt-5">Click "Save All" to apply all changes to the live footer.</p>
      </div>
    </AdminShell>
  );
}
