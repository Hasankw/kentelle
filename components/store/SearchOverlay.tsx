"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=6`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.products ?? []);
        }
      } catch {
        // ignore abort
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-brand-bg/95 backdrop-blur-sm flex flex-col"
        >
          <div className="max-w-2xl mx-auto w-full px-4 pt-20">
            {/* Search input */}
            <div className="relative flex items-center border-b-2 border-brand-navy pb-2 mb-8">
              <Search size={22} className="text-brand-contrast shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products…"
                className="flex-1 bg-transparent ml-3 text-xl font-body text-brand-navy outline-none placeholder:text-brand-contrast/50"
              />
              {loading && (
                <Loader2 size={18} className="animate-spin text-brand-contrast" />
              )}
              <button
                onClick={onClose}
                className="ml-3 text-brand-contrast hover:text-brand-navy transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <ul className="divide-y divide-brand-contrast/10">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 py-3 hover:pl-2 transition-all duration-150 group"
                    >
                      <div className="relative w-14 h-14 bg-brand-contrast/10 shrink-0">
                        {p.images[0] && (
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-heading font-bold text-sm text-brand-navy group-hover:text-brand-blue transition-colors">
                          {p.name}
                        </p>
                        <p className="text-sm text-brand-blue font-body">
                          {formatPrice(p.salePrice ?? p.price)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {query && !loading && results.length === 0 && (
              <p className="text-brand-contrast font-body text-center">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
