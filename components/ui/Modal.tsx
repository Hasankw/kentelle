"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brand-navy/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-brand-bg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl",
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-brand-contrast/20">
          {title && (
            <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-brand-navy">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto text-brand-contrast hover:text-brand-navy transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
