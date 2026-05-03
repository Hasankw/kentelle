"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

const emptyForm = {
  code: "",
  type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
  value: "",
  minOrder: "",
  maxUses: "",
  expiresAt: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCoupons = () =>
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((data) => { setCoupons(data); setLoading(false); });

  useEffect(() => { loadCoupons(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
    loadCoupons();
  };

  const toggleActive = async (c: Coupon) => {
    await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
    });
    setCoupons((prev) => prev.map((x) => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch("/api/admin/coupons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const fieldClass =
    "border border-brand-contrast/20 px-3 py-2 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-brand-navy">
            Coupons ({coupons.length})
          </h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-brand-accent text-brand-navy rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors"
          >
            <Plus size={14} />
            New Coupon
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-brand-contrast/10 shadow-sm p-6 mb-6 max-w-2xl">
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy mb-4">
              Create Coupon
            </h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                  Code *
                </label>
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className={`${fieldClass} w-full`}
                  placeholder="SUMMER20"
                />
              </div>
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                  Type *
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "PERCENTAGE" | "FIXED" }))}
                  className={`${fieldClass} w-full`}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                  Value * {form.type === "PERCENTAGE" ? "(%)" : "(AUD)"}
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  className={`${fieldClass} w-full`}
                  placeholder={form.type === "PERCENTAGE" ? "20" : "15"}
                />
              </div>
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                  Min Order (AUD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrder}
                  onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                  className={`${fieldClass} w-full`}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                  Max Uses (blank = unlimited)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                  className={`${fieldClass} w-full`}
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                  Expires At
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className={`${fieldClass} w-full`}
                />
              </div>
              <div className="col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-brand-navy text-brand-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Coupon"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-brand-contrast/20 text-brand-contrast text-xs font-heading font-bold uppercase tracking-widest hover:text-brand-navy transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border border-brand-contrast/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                {["Code", "Discount", "Min Order", "Uses", "Expires", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-contrast/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-brand-contrast">Loading...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-brand-contrast">
                    No coupons yet. Create your first one above.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-brand-navy text-xs tracking-wider">
                      {c.code}
                    </td>
                    <td className="px-5 py-3 font-bold text-brand-navy">
                      {c.type === "PERCENTAGE" ? `${c.value}%` : formatPrice(Number(c.value))}
                    </td>
                    <td className="px-5 py-3 text-brand-contrast">
                      {Number(c.minOrder) > 0 ? formatPrice(Number(c.minOrder)) : "—"}
                    </td>
                    <td className="px-5 py-3 text-brand-contrast">
                      {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td className="px-5 py-3 text-brand-contrast text-xs">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-AU") : "Never"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleActive(c)}
                          className={`transition-colors ${c.isActive ? "text-green-600 hover:text-gray-400" : "text-gray-400 hover:text-green-600"}`}
                          title={c.isActive ? "Deactivate" : "Activate"}
                        >
                          {c.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
