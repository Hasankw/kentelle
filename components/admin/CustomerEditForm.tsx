"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    proStatus?: string | null;
    proDocUrl?: string | null;
    proTrainingAck?: boolean;
  };
}

const PRO_STATUSES = [
  { value: "retail",   label: "Retail (no pro access)" },
  { value: "pending",  label: "Pending (awaiting review)" },
  { value: "approved", label: "Approved (full pro access)" },
];

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-100 text-green-700 border-green-200",
  pending:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  retail:   "bg-gray-100 text-gray-600 border-gray-200",
};

export default function CustomerEditForm({ customer }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone ?? "",
    proStatus: customer.proStatus ?? "retail",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fieldClass =
    "w-full border border-brand-contrast/20 px-4 py-3 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const res = await fetch(`/api/admin/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed to save changes");
      return;
    }
    setSuccess(true);
    router.refresh();
  };

  const currentStatus = form.proStatus ?? "retail";

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-brand-contrast/10 p-6 space-y-5">
      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Full Name
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Email
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
          Phone
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className={fieldClass}
        />
      </div>

      {/* Pro Status */}
      <div className="border-t border-brand-contrast/10 pt-5">
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-3">
          Professional Access Status
        </label>

        <div className={`mb-3 px-3 py-2 border rounded text-xs font-heading font-bold uppercase tracking-wide inline-block ${STATUS_STYLES[currentStatus] ?? STATUS_STYLES.retail}`}>
          Current: {currentStatus}
        </div>

        <select
          value={form.proStatus}
          onChange={(e) => setForm((f) => ({ ...f, proStatus: e.target.value }))}
          className={fieldClass}
        >
          {PRO_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {customer.proTrainingAck && (
          <p className="mt-2 text-xs text-green-700 font-body">
            ✓ Training acknowledgment confirmed
          </p>
        )}

        {customer.proDocUrl && (
          <div className="mt-3">
            <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">
              Submitted Certificate
            </p>
            <a
              href={customer.proDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-blue hover:underline font-body break-all"
            >
              View Certificate Document
            </a>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 font-body">{error}</p>}
      {success && <p className="text-xs text-green-600 font-body">Changes saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2.5 bg-brand-navy text-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
