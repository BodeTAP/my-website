"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, ShieldCheck } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "mfweb_cookie_consent";

export type ConsentLevel = "all" | "essential" | null;

export function getConsent(): ConsentLevel {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(STORAGE_KEY) as ConsentLevel) ?? null;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay so the page loads before banner appears
    const t = setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  function accept(level: "all" | "essential") {
    localStorage.setItem(STORAGE_KEY, level);
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="Persetujuan Cookie"
          className="fixed bottom-4 left-4 right-4 z-40 max-w-2xl mx-auto"
        >
          <div className="glass rounded-2xl border border-white/10 shadow-2xl shadow-black/40 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/15 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-4 h-4 text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm mb-1">Kami menggunakan cookie</p>
                <p className="text-blue-200/55 text-xs leading-relaxed">
                  Website ini menggunakan cookie esensial untuk keamanan dan fungsionalitas, serta cookie analitik untuk memahami cara penggunaan situs.{" "}
                  <Link href="/kebijakan-privasi" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
                    Kebijakan Privasi
                  </Link>
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button
                    onClick={() => accept("all")}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Terima Semua
                  </button>
                  <button
                    onClick={() => accept("essential")}
                    className="text-blue-200/60 hover:text-white text-xs px-3 py-2 rounded-lg hover:bg-white/5 transition-colors border border-white/10"
                  >
                    Hanya Esensial
                  </button>
                </div>
              </div>

              <button
                onClick={() => accept("essential")}
                className="text-blue-200/40 hover:text-white transition-colors p-1 shrink-0"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
