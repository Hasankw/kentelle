import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminChatPage() {
  let sessions: any[] = [];
  try {
    sessions = await db.chatSession.findMany({ orderBy: { createdAt: "desc" } });
    sessions = await Promise.all(
      sessions.map(async (s: any) => {
        const msgs = await db.chatMessage.findMany({
          where: { sessionId: s.sessionId },
          orderBy: { createdAt: "desc" },
          take: 1,
        });
        return { ...s, lastMessage: msgs[0] ?? null };
      })
    );
  } catch {
    sessions = [];
  }

  return (
    <AdminShell>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-2xl text-brand-navy">Chat Conversations</h1>
          <p className="text-sm font-body text-brand-contrast mt-1">{sessions.length} session{sessions.length !== 1 ? "s" : ""} total</p>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <MessageCircle size={40} className="text-brand-contrast/30 mb-4" />
            <p className="text-sm font-body text-brand-contrast">No chat sessions yet</p>
            <p className="text-xs font-body text-brand-contrast/60 mt-1">Conversations will appear here once customers start chatting</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s: any) => (
              <Link
                key={s.id}
                href={`/admin/chat/${s.sessionId}`}
                className="flex items-center gap-4 p-4 bg-white border border-brand-contrast/10 rounded hover:border-brand-blue/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#F0EBF4" }}>
                  <MessageCircle size={16} className="text-brand-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {s.userEmail ? (
                      <span className="flex items-center gap-1 text-xs font-body text-brand-navy font-medium">
                        <Mail size={11} className="text-brand-contrast" /> {s.userEmail}
                      </span>
                    ) : (
                      <span className="text-xs font-body text-brand-contrast italic">Anonymous</span>
                    )}
                  </div>
                  {s.lastMessage && (
                    <p className="text-xs font-body text-brand-contrast/70 truncate mt-0.5">
                      {s.lastMessage.role === "user" ? "User: " : "Keni: "}{s.lastMessage.content}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-body text-brand-contrast/50">
                    {new Date(s.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
