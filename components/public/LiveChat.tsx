"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343";
const WA_LINK = `https://wa.me/${WA}?text=${encodeURIComponent(
  "Halo MFWEB, saya ingin konsultasi pembuatan website. Bisa bantu?"
)}`;

function isOnline(): boolean {
  const wibTime = new Date().toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    hour12: false,
  });
  const h = parseInt(wibTime, 10);
  return h >= 9 && h < 21;
}

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => setOnline(isOnline()));

    if (!sessionStorage.getItem("chat_hinted")) {
      const t = setTimeout(() => {
        setHint(true);
        sessionStorage.setItem("chat_hinted", "1");
      }, 15_000);
      return () => clearTimeout(t);
    }
  }, []);

  function openChat() {
    setOpen(true);
    setHint(false);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-80 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white"
          >
            {/* Header */}
            <div className="bg-[#1E242E] px-4 py-3.5 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs select-none">
                    MF
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#1E242E] ${
                      online ? "bg-emerald-400" : "bg-slate-500"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-white font-bold text-xs leading-tight">Konsultasi MFWEB</p>
                  <p className="text-slate-400 text-[10px]">
                    {online ? "● Online sekarang" : "○ Offline · dibalas cepat"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Tutup chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="px-4 pt-4 pb-2 space-y-3 bg-slate-50">
              <ChatBubble delay={0}>
                Halo! 👋 Ada rencana membuat atau merombak website bisnis Anda?
              </ChatBubble>
              <ChatBubble delay={0.35}>
                Konsultasikan kebutuhan Anda gratis, kami siap membantu analisis awal 😊
              </ChatBubble>
            </div>

            {/* CTA */}
            <div className="px-4 pb-5 pt-3 bg-white border-t border-slate-100">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-full transition-colors text-xs shadow-xs"
              >
                {WA_ICON}
                Hubungi via WhatsApp
              </a>
              <p className="text-slate-400 text-[10px] text-center mt-2 font-medium">
                {online
                  ? "Biasanya kami membalas dalam beberapa menit"
                  : "Pesan Anda akan langsung masuk ke WhatsApp tim kami"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint bubble */}
      <AnimatePresence>
        {hint && !open && (
          <motion.button
            initial={{ opacity: 0, x: 16, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={openChat}
            className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-full border border-slate-200 shadow-lg hover:border-slate-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-slate-800 text-xs whitespace-nowrap font-semibold">Butuh bantuan konsultasi?</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <div className="relative">
        <motion.button
          onClick={() => (open ? setOpen(false) : openChat())}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-12 h-12 rounded-full bg-[#1E242E] hover:bg-slate-900 shadow-xl flex items-center justify-center text-white border border-slate-700/60 transition-colors"
          aria-label={open ? "Tutup chat" : "Buka live chat"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "x" : "msg"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {open
                ? <X className="w-4 h-4 text-white" />
                : <MessageCircle className="w-5 h-5 text-white" />
              }
            </motion.span>
          </AnimatePresence>

          {!open && online && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1E242E]" />
          )}
        </motion.button>
      </div>
    </div>
  );
}

function ChatBubble({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-start gap-2"
    >
      <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5 select-none">
        MF
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-3 py-2 max-w-[210px] shadow-2xs">
        <p className="text-slate-800 text-xs leading-relaxed">{children}</p>
      </div>
    </motion.div>
  );
}
