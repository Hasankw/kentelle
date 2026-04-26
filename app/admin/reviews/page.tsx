export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import StarRating from "@/components/ui/StarRating";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell>
      <div className="p-8">
        <h1 className="font-heading font-bold text-2xl text-brand-navy mb-6">
          Reviews ({reviews.length})
        </h1>

        <div className="bg-white border border-brand-contrast/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                {["Customer", "Rating", "Review", "Product", "Status", "Date"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-contrast/10">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-[#F8F9FC] transition-colors">
                  <td className="px-5 py-3 font-bold text-brand-navy">{r.customerName}</td>
                  <td className="px-5 py-3">
                    <StarRating rating={r.rating} size={12} />
                  </td>
                  <td className="px-5 py-3 text-brand-navy/80 max-w-xs truncate">{r.body}</td>
                  <td className="px-5 py-3 text-brand-contrast">{r.productName ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider ${
                      r.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {r.approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-brand-contrast whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString("en-AU")}
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-brand-contrast">
                    No reviews yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
