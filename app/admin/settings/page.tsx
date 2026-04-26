export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import SettingsForm from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

const KEYS = ["announcement_text", "announcement_enabled", "free_shipping_threshold", "footer_email", "footer_phone"];

export default async function AdminSettingsPage() {
  const rows = await db.content.findMany({ where: { key: { in: KEYS } } });
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <AdminShell>
      <div className="p-8">
        <h1 className="font-heading font-bold text-2xl text-brand-navy mb-6">
          Settings
        </h1>
        <div className="bg-white border border-brand-contrast/10 shadow-sm p-6 max-w-2xl">
          <SettingsForm settings={settings} />
        </div>
      </div>
    </AdminShell>
  );
}
