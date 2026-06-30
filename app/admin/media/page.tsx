import { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import MediaLibraryClient from "@/components/admin/MediaLibraryClient";

export const metadata: Metadata = { title: "Media Library" };

export default function AdminMediaPage() {
  return (
    <AdminShell>
      <MediaLibraryClient />
    </AdminShell>
  );
}
