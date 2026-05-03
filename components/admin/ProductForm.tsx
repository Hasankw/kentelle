"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface ProductData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  howToUse: string;
  routine: string;
  cautions: string;
  price: string;
  salePrice: string;
  stock: string;
  isActive: boolean;
  images: string[];
  categoryIds: string[];
}

export default function ProductForm({
  product,
  categories,
}: {
  product?: Partial<ProductData>;
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<ProductData>({
    id: product?.id,
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    ingredients: product?.ingredients ?? "",
    howToUse: product?.howToUse ?? "",
    routine: product?.routine ?? "",
    cautions: product?.cautions ?? "",
    price: product?.price ?? "",
    salePrice: product?.salePrice ?? "",
    stock: product?.stock ?? "0",
    isActive: product?.isActive ?? true,
    images: product?.images ?? [],
    categoryIds: product?.categoryIds ?? [],
  });
  const [imageInput, setImageInput] = useState("");

  const set = <K extends keyof ProductData>(key: K, value: ProductData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleNameChange = (v: string) => {
    set("name", v);
    if (!product?.id) set("slug", slugify(v));
  };

  const addImage = () => {
    const url = imageInput.trim();
    if (url && !form.images.includes(url)) {
      set("images", [...form.images, url]);
      setImageInput("");
    }
  };

  const removeImage = (url: string) =>
    set("images", form.images.filter((i) => i !== url));

  const toggleCategory = (id: string) =>
    set(
      "categoryIds",
      form.categoryIds.includes(id)
        ? form.categoryIds.filter((c) => c !== id)
        : [...form.categoryIds, id]
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const url = form.id ? `/api/admin/products/${form.id}` : "/api/admin/products";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
          stock: parseInt(form.stock, 10),
        }),
      });
      if (res.ok) router.push("/admin/products");
    });
  };

  const handleDelete = () => {
    if (!form.id || !confirm("Delete this product?")) return;
    startTransition(async () => {
      await fetch(`/api/admin/products/${form.id}`, { method: "DELETE" });
      router.push("/admin/products");
    });
  };

  const fieldClass =
    "w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
            Name *
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
            Slug *
          </label>
          <input
            required
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            className={`${fieldClass} font-mono`}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Description
        </label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={`${fieldClass} resize-none`}
        />
      </div>

      {/* Pricing + stock */}
      <div className="grid grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
            Price (AUD) *
          </label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
            Sale Price
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.salePrice}
            onChange={(e) => set("salePrice", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
            Stock *
          </label>
          <input
            required
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      {/* Content tabs */}
      {(
        [
          ["Ingredients", "ingredients"],
          ["How to Use", "howToUse"],
          ["Routine", "routine"],
          ["Cautions", "cautions"],
        ] as [string, keyof ProductData][]
      ).map(([label, key]) => (
        <div key={key}>
          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
            {label}
          </label>
          <textarea
            rows={3}
            value={form[key] as string}
            onChange={(e) => set(key, e.target.value)}
            className={`${fieldClass} resize-none`}
          />
        </div>
      ))}

      {/* Images */}
      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Images
        </label>
        <div className="flex gap-2 mb-2">
          <input
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
            placeholder="Paste image URL…"
            className={`${fieldClass} flex-1`}
          />
          <button
            type="button"
            onClick={addImage}
            className="px-4 py-2 bg-brand-navy text-brand-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.images.map((url) => (
              <div key={url} className="flex items-center gap-1 bg-brand-contrast/10 px-2 py-1 text-xs font-body text-brand-navy rounded">
                <span className="max-w-[200px] truncate">{url}</span>
                <button type="button" onClick={() => removeImage(url)} className="text-red-500 hover:text-red-700">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-2">
          Categories
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider border transition-colors ${
                form.categoryIds.includes(cat.id)
                  ? "border-brand-navy bg-brand-navy text-brand-white rounded"
                  : "border-brand-contrast/20 text-brand-contrast hover:border-brand-navy hover:text-brand-navy"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={form.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
          className="accent-brand-blue w-4 h-4"
        />
        <label htmlFor="isActive" className="text-sm font-body text-brand-navy">
          Active (visible in store)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-brand-navy text-brand-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : form.id ? "Update Product" : "Create Product"}
        </button>
        {form.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-6 py-2.5 border border-red-200 text-red-600 text-xs font-heading font-bold uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
