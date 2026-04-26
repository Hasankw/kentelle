"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LogOut } from "lucide-react";

export default function AccountLogout() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
  );

  const handleLogout = () => {
    startTransition(async () => {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 border border-brand-contrast/20 text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast hover:text-brand-navy hover:border-brand-navy transition-colors disabled:opacity-50"
    >
      <LogOut size={14} />
      Sign Out
    </button>
  );
}
