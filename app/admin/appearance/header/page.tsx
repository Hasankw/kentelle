"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, ChevronRight } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

interface SubItem { id: string; label: string; href: string; enabled: boolean; }
interface NavItem { id: string; label: string; href: string; enabled: boolean; children: SubItem[]; }

const DEFAULTS: NavItem[] = [
  { id: "1", label: "Shop", href: "/shop", enabled: true, children: [] },
  { id: "2", label: "Collections", href: "/collections", enabled: true, children: [] },
  { id: "3", label: "About", href: "/about", enabled: true, children: [] },
  { id: "4", label: "Contact", href: "/contact", enabled: true, children: [] },
];

export default function HeaderNavAdminPage() {
  const [items, setItems] = useState<NavItem[]>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages/content?key=nav_header")
      .then((r) => r.json())
      .then((d) => { if (d.value) setItems(JSON.parse(d.value)); });
  }, []);

  const save = async (list: NavItem[] = items) => {
    setSaving(true);
    await fetch("/api/admin/pages/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "nav_header", value: JSON.stringify(list) }),
    });
    setSaving(false);
    setStatus("Saved!");
    setTimeout(() => setStatus(null), 2000);
  };

  const update = (id: string, field: keyof NavItem, val: string | boolean) =>
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: val } : it));

  const updateChild = (parentId: string, childId: string, field: keyof SubItem, val: string | boolean) =>
    setItems((prev) => prev.map((it) => it.id === parentId
      ? { ...it, children: it.children.map((c) => c.id === childId ? { ...c, [field]: val } : c) }
      : it
    ));

  const move = (id: string, dir: -1 | 1) => {
    const idx = items.findIndex((it) => it.id === id);
    if (idx + dir < 0 || idx + dir >= items.length) return;
    const next = [...items];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    setItems(next);
  };

  const moveChild = (parentId: string, childId: string, dir: -1 | 1) => {
    setItems((prev) => prev.map((it) => {
      if (it.id !== parentId) return it;
      const idx = it.children.findIndex((c) => c.id === childId);
      if (idx + dir < 0 || idx + dir >= it.children.length) return it;
      const next = [...it.children];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return { ...it, children: next };
    }));
  };

  const remove = (id: string) => {
    if (!confirm("Delete this nav item?")) return;
    const next = items.filter((it) => it.id !== id);
    setItems(next); save(next);
  };

  const removeChild = (parentId: string, childId: string) => {
    if (!confirm("Delete this sub-item?")) return;
    const next = items.map((it) => it.id === parentId
      ? { ...it, children: it.children.filter((c) => c.id !== childId) }
      : it
    );
    setItems(next); save(next);
  };

  const add = () => {
    const newId = crypto.randomUUID();
    const next = [...items, { id: newId, label: "New Link", href: "/", enabled: true, children: [] }];
    setItems(next);
    setEditing(newId);
  };

  const addChild = (parentId: string) => {
    const childId = crypto.randomUUID();
    setItems((prev) => prev.map((it) => it.id === parentId
      ? { ...it, children: [...it.children, { id: childId, label: "Sub Link", href: "/", enabled: true }] }
      : it
    ));
    setExpanded(parentId);
  };

  const inputCls = "w-full border border-brand-contrast/20 px-3 py-2 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/appearance" className="text-brand-contrast hover:text-brand-navy"><ArrowLeft size={18} /></Link>
            <div>
              <h1 className="font-heading font-bold text-2xl text-brand-navy">Header Navigation</h1>
              <p className="text-xs font-body text-brand-contrast mt-0.5">{items.length} links · {items.filter(i => i.enabled).length} enabled</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status && <span className="text-xs font-heading font-bold text-green-600 uppercase tracking-wider">{status}</span>}
            <button onClick={add} className="flex items-center gap-2 border border-brand-contrast/20 text-brand-contrast rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-[#F8F9FC] transition-colors">
              <Plus size={14} /> Add Link
            </button>
            <button onClick={() => save()} disabled={saving} className="bg-brand-navy text-brand-white rounded px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50">
              {saving ? "Saving…" : "Save All"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={item.id} className={`bg-white border ${item.enabled ? "border-brand-contrast/10" : "border-brand-contrast/5 opacity-60"}`}>
              {/* Main row */}
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => move(item.id, -1)} disabled={i === 0} className="text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20"><ChevronUp size={13} /></button>
                  <button onClick={() => move(item.id, 1)} disabled={i === items.length - 1} className="text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20"><ChevronDown size={13} /></button>
                </div>
                <span className="text-xs font-heading font-bold text-brand-contrast/40 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-heading font-bold text-brand-navy">{item.label}</p>
                  <p className="text-xs font-body text-brand-contrast/60">{item.href}</p>
                </div>
                {item.children.length > 0 && (
                  <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} className="flex items-center gap-1 text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast/60 hover:text-brand-navy px-2 py-1 transition-colors">
                    <ChevronRight size={11} className={`transition-transform ${expanded === item.id ? "rotate-90" : ""}`} />
                    {item.children.length} sub
                  </button>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { update(item.id, "enabled", !item.enabled); }}
                    className={`flex items-center gap-1.5 text-[10px] font-heading font-bold uppercase tracking-wider px-3 py-1.5 transition-colors ${item.enabled ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-[#F8F9FC] text-brand-contrast hover:bg-brand-contrast/10"}`}
                  >
                    {item.enabled ? <Eye size={11} /> : <EyeOff size={11} />}
                    {item.enabled ? "On" : "Off"}
                  </button>
                  <button onClick={() => setEditing(editing === item.id ? null : item.id)} className="text-[10px] font-heading font-bold uppercase tracking-wider px-3 py-1.5 border border-brand-contrast/20 text-brand-contrast hover:text-brand-navy hover:border-brand-navy transition-colors">
                    {editing === item.id ? "Close" : "Edit"}
                  </button>
                  <button onClick={() => addChild(item.id)} className="text-[10px] font-heading font-bold uppercase tracking-wider px-3 py-1.5 border border-brand-contrast/20 text-brand-contrast hover:text-brand-navy transition-colors" title="Add sub-menu item">
                    + Sub
                  </button>
                  <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Edit form */}
              {editing === item.id && (
                <div className="border-t border-brand-contrast/10 p-5 bg-[#F8F9FC] space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">Label</label>
                      <input value={item.label} onChange={(e) => update(item.id, "label", e.target.value)} className={inputCls} placeholder="Shop" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">URL / Href</label>
                      <input value={item.href} onChange={(e) => update(item.id, "href", e.target.value)} className={inputCls} placeholder="/shop" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => { setEditing(null); save(); }} className="px-6 py-2.5 bg-brand-navy text-brand-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors">Save</button>
                    <button onClick={() => setEditing(null)} className="px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-navy transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              {/* Sub-menu items */}
              {(expanded === item.id || item.children.length > 0) && expanded === item.id && (
                <div className="border-t border-brand-contrast/10 bg-[#F8F9FC]">
                  {item.children.length === 0 ? (
                    <p className="px-10 py-4 text-xs font-body text-brand-contrast/60">No sub-menu items. Click &ldquo;+ Sub&rdquo; above to add one.</p>
                  ) : (
                    <div className="divide-y divide-brand-contrast/10">
                      {item.children.map((child, ci) => (
                        <div key={child.id} className={`flex items-center gap-3 pl-10 pr-5 py-3 ${!child.enabled ? "opacity-50" : ""}`}>
                          <div className="flex flex-col gap-0.5">
                            <button onClick={() => moveChild(item.id, child.id, -1)} disabled={ci === 0} className="text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20"><ChevronUp size={11} /></button>
                            <button onClick={() => moveChild(item.id, child.id, 1)} disabled={ci === item.children.length - 1} className="text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20"><ChevronDown size={11} /></button>
                          </div>
                          <input
                            value={child.label}
                            onChange={(e) => updateChild(item.id, child.id, "label", e.target.value)}
                            className="border border-brand-contrast/20 px-2 py-1.5 text-xs font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue w-36"
                            placeholder="Label"
                          />
                          <input
                            value={child.href}
                            onChange={(e) => updateChild(item.id, child.id, "href", e.target.value)}
                            className="border border-brand-contrast/20 px-2 py-1.5 text-xs font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue flex-1"
                            placeholder="/path"
                          />
                          <button
                            onClick={() => updateChild(item.id, child.id, "enabled", !child.enabled)}
                            className={`flex items-center gap-1 text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-1 transition-colors ${child.enabled ? "text-green-700" : "text-brand-contrast/60"}`}
                          >
                            {child.enabled ? <Eye size={10} /> : <EyeOff size={10} />}
                          </button>
                          <button onClick={() => removeChild(item.id, child.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="px-10 py-3 border-t border-brand-contrast/10">
                    <button onClick={() => addChild(item.id)} className="text-[10px] font-heading font-bold uppercase tracking-wider text-brand-blue hover:text-brand-navy transition-colors flex items-center gap-1">
                      <Plus size={11} /> Add Sub-Menu Item
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs font-body text-brand-contrast mt-4">Inline edits to sub-menu items are saved when you click &ldquo;Save All&rdquo;.</p>
      </div>
    </AdminShell>
  );
}
