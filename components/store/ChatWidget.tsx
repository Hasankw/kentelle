"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";

type Product = { slug: string; name: string; price: number };

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  collectEmail?: boolean;
};

type GeminiHistory = { role: "user" | "model"; parts: [{ text: string }] };

const QUICK_PROMPTS = [
  { label: "Dry skin help", text: "What products should I use for dry skin?" },
  { label: "Anti-ageing routine", text: "What are your best anti-ageing products?" },
  { label: "Brightening skin", text: "How can I brighten my skin and reduce dark spots?" },
  { label: "Sensitive skin", text: "My skin is sensitive, what do you recommend?" },
  { label: "Pore minimising", text: "What products help minimise pores?" },
  { label: "Hydration boost", text: "I need deep hydration products" },
];

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("keni_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("keni_session", id);
  }
  return id;
}

export default function ChatWidget() {
  const cartCount = useCartStore((s) => s.itemCount());
  const hasCart = cartCount > 0;
  const [enabled, setEnabled] = useState(true);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm Keni 👋 your skincare advisor at Kentelle. What's your skin concern today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sessionId] = useState(() => (typeof window !== "undefined" ? getOrCreateSessionId() : ""));
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/chat/status").then((r) => r.json()).then((d) => setEnabled(d.enabled !== false)).catch(() => {});
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, messages]);

  const buildHistory = (): GeminiHistory[] => {
    return messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text, history: buildHistory() }),
      });

      if (res.status === 503) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: "Our chat advisor is currently unavailable. Please contact us directly at our email." },
        ]);
        return;
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        products: data.products?.length ? data.products : undefined,
        collectEmail: data.collectEmail,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!emailInput.trim()) return;
    await fetch("/api/chat/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, email: emailInput.trim() }),
    });
    setEmailSent(true);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "assistant", content: "Thank you! Our team will reach out to you shortly." },
    ]);
  };

  const hasCollectEmail = messages.some((m) => m.collectEmail) && !emailSent;

  if (!enabled) return null;

  return (
    <>
      {/* Bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat"
        className={`fixed ${hasCart ? "bottom-24" : "bottom-6"} right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95`}
        style={{ background: "linear-gradient(135deg, #D4A5B5 0%, #B5C9C5 100%)" }}
      >
        {open ? <X size={22} color="#3A3240" /> : <MessageCircle size={22} color="#3A3240" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className={`fixed ${hasCart ? "bottom-[11rem]" : "bottom-[5.5rem]"} right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] flex flex-col shadow-2xl overflow-hidden`}
          style={{ borderRadius: 16, height: 520, background: "#FAF8F7", border: "1px solid #E8DFEA" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ background: "linear-gradient(135deg, #3A3240 0%, #4A3F52 100%)" }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#D4A5B5" }}>
              <MessageCircle size={15} color="#3A3240" />
            </div>
            <div>
              <p className="text-xs font-heading font-bold uppercase tracking-widest text-white">Keni</p>
              <p className="text-[10px] text-white/60 font-body">Kentelle Skincare Advisor</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/60 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: "thin" }}>
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%] px-3 py-2 text-sm font-body leading-relaxed"
                    style={{
                      borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                      background: msg.role === "user" ? "#3A3240" : "#F0EBF4",
                      color: msg.role === "user" ? "#FAF8F7" : "#3A3240",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>

                {/* Product cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {msg.products.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/products/${p.slug}`}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-body transition-colors hover:opacity-90"
                        style={{ background: "#EDE6F0", color: "#3A3240" }}
                      >
                        <span className="font-heading font-bold">{p.name}</span>
                        <span className="flex items-center gap-1 text-[#9B8FA0]">
                          ${p.price} <ChevronRight size={12} />
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl text-sm font-body" style={{ background: "#F0EBF4", color: "#9B8FA0" }}>
                  <span className="animate-pulse">Keni is typing…</span>
                </div>
              </div>
            )}

            {/* Email collection */}
            {hasCollectEmail && (
              <div className="rounded-xl p-3 space-y-2" style={{ background: "#F5EEF3", border: "1px solid #D4A5B5" }}>
                <p className="text-xs font-body text-[#3A3240]">Leave your email and our team will get back to you shortly.</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-2 py-1.5 text-xs font-body border rounded-lg focus:outline-none"
                    style={{ borderColor: "#D4A5B5", background: "white", color: "#3A3240" }}
                    onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                  />
                  <button
                    onClick={handleEmailSubmit}
                    className="px-3 py-1.5 text-xs font-heading font-bold rounded-lg text-white transition-opacity hover:opacity-80"
                    style={{ background: "#3A3240" }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick prompts — only show at start */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => sendMessage(q.text)}
                  className="px-2.5 py-1 text-[11px] font-body rounded-full border transition-colors hover:opacity-80"
                  style={{ borderColor: "#D4A5B5", color: "#3A3240", background: "white" }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: "1px solid #E8DFEA" }}>
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask me anything about skincare…"
                disabled={loading}
                className="flex-1 px-3 py-2 text-xs font-body rounded-lg focus:outline-none"
                style={{ background: "#F0EBF4", color: "#3A3240", border: "none" }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-40"
                style={{ background: "#3A3240" }}
              >
                <Send size={14} color="#FAF8F7" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
