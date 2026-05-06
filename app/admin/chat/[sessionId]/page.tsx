import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";
import { ArrowLeft, User, Bot, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminChatSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  let messages: any[] = [];
  let session: any = null;
  try {
    const sessions = await db.chatSession.findMany({ orderBy: { createdAt: "asc" } });
    session = sessions.find((s: any) => s.sessionId === sessionId) ?? null;
    messages = await db.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    messages = [];
  }

  return (
    <AdminShell>
      <div className="p-8 max-w-3xl">
        <Link href="/admin/chat" className="inline-flex items-center gap-2 text-xs font-body text-brand-contrast hover:text-brand-navy mb-6">
          <ArrowLeft size={14} /> All Conversations
        </Link>

        <div className="mb-6">
          <h1 className="font-heading font-bold text-xl text-brand-navy">Conversation</h1>
          {session?.userEmail ? (
            <p className="flex items-center gap-1.5 text-sm font-body text-brand-contrast mt-1">
              <Mail size={13} /> {session.userEmail}
            </p>
          ) : (
            <p className="text-sm font-body text-brand-contrast/60 italic mt-1">Anonymous visitor</p>
          )}
          {session && (
            <p className="text-xs font-body text-brand-contrast/50 mt-0.5">
              Started {new Date(session.createdAt).toLocaleString("en-AU")}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {messages.map((msg: any) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#D4A5B5" }}>
                  <Bot size={13} color="#3A3240" />
                </div>
              )}
              <div
                className="max-w-[75%] px-3.5 py-2.5 text-sm font-body leading-relaxed"
                style={{
                  borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  background: msg.role === "user" ? "#3A3240" : "#F0EBF4",
                  color: msg.role === "user" ? "#FAF8F7" : "#3A3240",
                }}
              >
                <p>{msg.content}</p>
                {msg.metadata?.products && (
                  <div className="mt-2 space-y-1">
                    {msg.metadata.products.map((p: any) => (
                      <div key={p.slug} className="text-xs px-2 py-1 rounded" style={{ background: "#EDE6F0" }}>
                        {p.name} — ${p.price}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#3A3240" }}>
                  <User size={13} color="#FAF8F7" />
                </div>
              )}
            </div>
          ))}

          {messages.length === 0 && (
            <p className="text-sm font-body text-brand-contrast/60 text-center py-12">No messages in this session</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
