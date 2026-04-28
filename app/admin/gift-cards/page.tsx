"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Gift, Plus, Send, X } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/utils";

type GiftCard = {
  id: string;
  code: string;
  amount: number;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  message: string;
  status: string;
  createdAt: string;
  redeemedAt: string | null;
};

const PRESET_AMOUNTS = [50, 100, 200, 300];

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    recipientEmail: "",
    recipientName: "",
    senderName: "Kentelle",
    amount: "100",
    message: "",
    sendEmail: true,
  });
  const [created, setCreated] = useState<GiftCard | null>(null);

  useEffect(() => {
    fetch("/api/admin/gift-cards")
      .then((r) => r.json())
      .then((data) => { setCards(data); setLoading(false); });
  }, []);

  const handleCreate = async () => {
    if (!form.recipientEmail || !form.amount) return;
    setCreating(true);
    const res = await fetch("/api/admin/gift-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const card = await res.json();
    setCreating(false);
    if (card.id) {
      setCards((prev) => [card, ...prev]);
      setCreated(card);
      setForm({ recipientEmail: "", recipientName: "", senderName: "Kentelle", amount: "100", message: "", sendEmail: true });
    }
  };

  const totalValue = cards.reduce((s, c) => s + Number(c.amount), 0);
  const activeCount = cards.filter((c) => c.status === "ACTIVE").length;

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Gift size={22} className="text-brand-navy" />
            <h1 className="font-heading font-bold text-2xl text-brand-navy">Gift Cards</h1>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setCreated(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? "Cancel" : "Generate Gift Card"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Issued", value: cards.length.toString() },
            { label: "Active", value: activeCount.toString() },
            { label: "Total Value", value: formatPrice(totalValue) },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-brand-contrast/10 p-5">
              <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-contrast mb-1">{stat.label}</p>
              <p className="font-heading font-bold text-2xl text-brand-navy">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-white border-2 border-brand-accent/40 p-6 mb-6">
            <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy mb-5">
              Generate New Gift Card
            </h2>

            {created && (
              <div className="mb-5 px-4 py-4 bg-green-50 border border-green-200">
                <p className="text-xs font-heading font-bold uppercase tracking-wider text-green-700 mb-1">Gift Card Created!</p>
                <p className="font-mono font-bold text-xl text-brand-navy tracking-widest">{created.code}</p>
                <p className="text-xs text-green-700 mt-1">
                  {formatPrice(Number(created.amount))} · Sent to {created.recipientEmail}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  value={form.recipientEmail}
                  onChange={(e) => setForm((f) => ({ ...f, recipientEmail: e.target.value }))}
                  className="w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy focus:outline-none focus:border-brand-blue"
                  placeholder="customer@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={form.recipientName}
                  onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                  className="w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy focus:outline-none focus:border-brand-blue"
                  placeholder="Jane Smith"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                Amount (AUD)
              </label>
              <div className="flex gap-2 mb-2">
                {PRESET_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setForm((f) => ({ ...f, amount: a.toString() }))}
                    className={`px-4 py-2 border-2 text-xs font-heading font-bold transition-colors ${
                      form.amount === a.toString()
                        ? "border-brand-navy bg-brand-navy/5 text-brand-navy"
                        : "border-brand-contrast/20 text-brand-contrast hover:border-brand-navy/40"
                    }`}
                  >
                    ${a}
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="flex-1 border border-brand-contrast/20 px-3 py-2 text-sm font-body text-brand-navy focus:outline-none focus:border-brand-blue"
                  placeholder="Custom amount"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                  From (Sender Name)
                </label>
                <input
                  type="text"
                  value={form.senderName}
                  onChange={(e) => setForm((f) => ({ ...f, senderName: e.target.value }))}
                  className="w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy focus:outline-none focus:border-brand-blue"
                  placeholder="Kentelle"
                />
              </div>
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                  Personal Message
                </label>
                <input
                  type="text"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy focus:outline-none focus:border-brand-blue"
                  placeholder="Happy Birthday! (optional)"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sendEmail}
                  onChange={(e) => setForm((f) => ({ ...f, sendEmail: e.target.checked }))}
                  className="accent-brand-navy w-4 h-4"
                />
                <span className="text-sm font-body text-brand-navy">Send gift card via email</span>
              </label>
              <button
                onClick={handleCreate}
                disabled={creating || !form.recipientEmail || !form.amount}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent text-brand-navy text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors disabled:opacity-50"
              >
                <Send size={13} />
                {creating ? "Creating..." : "Create & Send"}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <p className="text-sm font-body text-brand-contrast">Loading...</p>
        ) : (
          <div className="bg-white border border-brand-contrast/10 overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                  {["Code", "Amount", "Recipient", "Sender", "Message", "Status", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-contrast/10">
                {cards.map((card) => (
                  <tr key={card.id} className={`transition-colors ${card.status === "REDEEMED" ? "opacity-50 bg-gray-50" : "hover:bg-[#F8F9FC]"}`}>
                    <td className="px-5 py-3 font-mono font-bold text-brand-navy text-xs tracking-wider">{card.code}</td>
                    <td className="px-5 py-3 font-bold text-brand-navy">{formatPrice(Number(card.amount))}</td>
                    <td className="px-5 py-3 text-brand-contrast">
                      <div>{card.recipientName || "—"}</div>
                      <div className="text-xs text-brand-contrast/60">{card.recipientEmail}</div>
                    </td>
                    <td className="px-5 py-3 text-brand-contrast">{card.senderName || "—"}</td>
                    <td className="px-5 py-3 text-brand-contrast max-w-[160px] truncate">{card.message || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider ${
                        card.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {card.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-contrast text-xs">
                      {new Date(card.createdAt).toLocaleDateString("en-AU")}
                      {card.redeemedAt && (
                        <div className="text-brand-contrast/60">Redeemed {new Date(card.redeemedAt).toLocaleDateString("en-AU")}</div>
                      )}
                    </td>
                  </tr>
                ))}
                {cards.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-brand-contrast">No gift cards yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
