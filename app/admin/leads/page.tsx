export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Leads" };

export default async function AdminLeadsPage() {
  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell>
      <div className="p-8">
        <h1 className="font-heading font-bold text-2xl text-brand-navy mb-6">
          Contact Leads ({leads.length})
        </h1>

        <div className="space-y-4">
          {leads.length === 0 && (
            <div className="text-center py-10 text-brand-contrast font-body">
              No leads yet.
            </div>
          )}
          {leads.map((lead) => (
            <div
              key={lead.id}
              className={`bg-white border p-5 ${
                lead.reviewed
                  ? "border-brand-contrast/10"
                  : "border-brand-blue/30"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-heading font-bold text-sm text-brand-navy">
                    {lead.name}
                  </p>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-xs text-brand-blue hover:underline font-body"
                  >
                    {lead.email}
                  </a>
                  {lead.phone && (
                    <p className="text-xs text-brand-contrast font-body">
                      {lead.phone}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-brand-contrast font-body">
                    {new Date(lead.createdAt).toLocaleDateString("en-AU")}
                  </p>
                  {!lead.reviewed && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-heading font-bold uppercase bg-brand-blue text-white">
                      New
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm font-body text-brand-navy/80 leading-relaxed">
                {lead.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
