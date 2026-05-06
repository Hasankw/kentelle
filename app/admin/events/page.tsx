"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, CalendarDays } from "lucide-react";

type Event = {
  id: string;
  title: string;
  subtitle: string | null;
  enabled: boolean;
  productCount: number;
  createdAt: string;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/events");
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createEvent = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, subtitle: newSubtitle }),
    });
    if (res.ok) {
      const event = await res.json();
      setCreating(false);
      setNewTitle("");
      setNewSubtitle("");
      window.location.href = `/admin/events/${event.id}`;
    }
    setSaving(false);
  };

  const toggleEnabled = async (event: Event) => {
    setEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, enabled: !e.enabled } : e));
    await fetch(`/api/admin/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !event.enabled }),
    });
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event? This will also remove all tagged products.")) return;
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading font-bold text-2xl text-brand-navy">Featured Events</h1>
            <p className="text-xs font-body text-brand-contrast mt-1">Create seasonal promotions and tag products to feature on the homepage</p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-brand-accent text-brand-navy rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors"
          >
            <Plus size={14} /> New Event
          </button>
        </div>

        {/* Create form */}
        {creating && (
          <div className="mb-6 bg-white border border-brand-blue/30 rounded p-5 shadow-sm">
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy mb-4">New Event</h2>
            <div className="space-y-3 max-w-lg">
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">Title *</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Mother's Day Special"
                  className="w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue"
                  onKeyDown={(e) => e.key === "Enter" && createEvent()}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">Subtitle</label>
                <input
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="e.g. Treat the special women in your life"
                  className="w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={createEvent}
                  disabled={!newTitle.trim() || saving}
                  className="px-5 py-2 bg-brand-navy text-white text-xs font-heading font-bold uppercase tracking-widest rounded hover:bg-brand-blue transition-colors disabled:opacity-50"
                >
                  {saving ? "Creating…" : "Create & Add Products"}
                </button>
                <button
                  onClick={() => { setCreating(false); setNewTitle(""); setNewSubtitle(""); }}
                  className="px-5 py-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-navy transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Events list */}
        {loading ? (
          <div className="text-sm font-body text-brand-contrast py-12 text-center">Loading…</div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CalendarDays size={40} className="text-brand-contrast/30 mb-4" />
            <p className="text-sm font-body text-brand-contrast">No events yet</p>
            <p className="text-xs font-body text-brand-contrast/60 mt-1">Create your first event to feature products on the homepage</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="bg-white border border-brand-contrast/10 rounded p-5 flex items-center gap-4">
                {/* Toggle */}
                <button
                  onClick={() => toggleEnabled(event)}
                  className="shrink-0 transition-colors"
                  title={event.enabled ? "Disable event" : "Enable event"}
                >
                  {event.enabled
                    ? <ToggleRight size={32} className="text-brand-blue" />
                    : <ToggleLeft size={32} className="text-brand-contrast/40" />
                  }
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-sm text-brand-navy">{event.title}</h3>
                    {event.enabled && (
                      <span className="text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue">Live</span>
                    )}
                  </div>
                  {event.subtitle && (
                    <p className="text-xs font-body text-brand-contrast mt-0.5 truncate">{event.subtitle}</p>
                  )}
                  <p className="text-[11px] font-body text-brand-contrast/50 mt-1">
                    {event.productCount} product{event.productCount !== 1 ? "s" : ""} tagged
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider border border-brand-navy text-brand-navy rounded hover:bg-brand-navy hover:text-white transition-colors"
                  >
                    <Pencil size={11} /> Edit
                  </Link>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="p-1.5 text-brand-contrast/40 hover:text-red-500 transition-colors rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
