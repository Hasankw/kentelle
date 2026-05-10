"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  approved: boolean;
}

export default function ReviewActions({ id, approved }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !approved }),
    });
    router.refresh();
    setLoading(false);
  }

  async function remove() {
    if (!confirm("Delete this review?")) return;
    setLoading(true);
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={loading}
        className={`px-3 py-1 text-[10px] font-heading font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
          approved
            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
            : "bg-green-100 text-green-700 hover:bg-green-200"
        }`}
      >
        {approved ? "Revoke" : "Approve"}
      </button>
      <button
        onClick={remove}
        disabled={loading}
        className="px-3 py-1 text-[10px] font-heading font-bold uppercase tracking-wider bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
