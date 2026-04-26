"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  type: "success" | "error";
  message: string;
}

let listeners: Array<(msg: ToastMessage) => void> = [];

export function toast(type: "success" | "error", message: string) {
  const msg: ToastMessage = { id: crypto.randomUUID(), type, message };
  listeners.forEach((l) => l(msg));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (msg: ToastMessage) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== msg.id)),
        4000
      );
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 shadow-lg text-sm font-body min-w-[240px]",
            t.type === "success"
              ? "bg-brand-navy text-white"
              : "bg-red-600 text-white"
          )}
        >
          {t.type === "success" ? (
            <CheckCircle size={16} className="shrink-0" />
          ) : (
            <AlertCircle size={16} className="shrink-0" />
          )}
          <span>{t.message}</span>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }
            className="ml-auto opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
