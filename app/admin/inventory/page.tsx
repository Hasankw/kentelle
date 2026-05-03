"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Minus, Plus, Save, AlertTriangle } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/utils";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
  isActive: boolean;
};

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        const initial: Record<string, number> = {};
        data.forEach((p: ProductRow) => { initial[p.id] = p.stock; });
        setStocks(initial);
        setLoading(false);
      });
  }, []);

  const setStock = (id: string, val: number) => {
    setStocks((s) => ({ ...s, [id]: Math.max(0, val) }));
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = Object.entries(stocks).map(([id, stock]) => ({ id, stock }));
    await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const lowStock = products.filter((p) => (stocks[p.id] ?? p.stock) < 5);

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading font-bold text-2xl text-brand-navy">Inventory</h1>
            {lowStock.length > 0 && (
              <p className="text-xs text-yellow-600 font-body mt-1 flex items-center gap-1">
                <AlertTriangle size={12} />
                {lowStock.length} product{lowStock.length > 1 ? "s" : ""} low on stock
              </p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-brand-accent text-brand-navy rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saving..." : saved ? "Saved!" : "Save All"}
          </button>
        </div>

        {loading ? (
          <p className="text-sm font-body text-brand-contrast">Loading...</p>
        ) : (
          <div className="bg-white border border-brand-contrast/10 shadow-sm overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                  {["Image", "Product", "Price", "Status", "Stock"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-contrast/10">
                {products.map((p) => {
                  const stock = stocks[p.id] ?? p.stock;
                  const stockColor = stock === 0 ? "text-red-500" : stock < 5 ? "text-yellow-600" : "text-green-600";
                  return (
                    <tr key={p.id} className="hover:bg-[#F8F9FC] transition-colors">
                      <td className="px-5 py-3">
                        <div className="relative w-10 h-10 bg-brand-contrast/10">
                          {p.images[0] && (
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-bold text-brand-navy max-w-[220px] truncate">
                        {p.name}
                      </td>
                      <td className="px-5 py-3 text-brand-contrast">{formatPrice(p.price)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {p.isActive ? "Active" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setStock(p.id, stock - 1)}
                            className="w-7 h-7 border border-brand-contrast/30 flex items-center justify-center hover:border-brand-navy transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={stock}
                            onChange={(e) => setStock(p.id, parseInt(e.target.value) || 0)}
                            className={`w-16 text-center border border-brand-contrast/30 py-1 text-sm font-bold ${stockColor} focus:outline-none focus:border-brand-navy`}
                          />
                          <button
                            onClick={() => setStock(p.id, stock + 1)}
                            className="w-7 h-7 border border-brand-contrast/30 flex items-center justify-center hover:border-brand-navy transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                          {stock < 5 && (
                            <AlertTriangle size={14} className={stock === 0 ? "text-red-500" : "text-yellow-500"} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
