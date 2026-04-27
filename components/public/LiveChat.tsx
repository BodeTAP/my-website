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
    setOnline(isOnline());

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
            className="w-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10"
            style={{ background: "rgba(8,18,36,0.95)", backdropFilter: "blur(24px)" }}
          >
            {/* Header */}
            <div className="bg-blue-600 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm select-none">
                    MF
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-blue-600 ${
                      online ? "bg-green-400" : "bg-slate-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">Tim MFWEB</p>
                  <p className="text-blue-100/70 text-xs">
                    {online ? "● Online sekarang" : "○ Offline · balas segera"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-1"
                aria-label="Tutup chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="px-4 pt-4 pb-2 space-y-3">
              <ChatBubble delay={0}>
                Halo! 👋 Selamat datang di MFWEB.
              </ChatBubble>
              <ChatBubble delay={0.35}>
                Ada yang bisa kami bantu? Konsultasi website gratis dan tanpa kewajiban 😊
              </ChatBubble>
            </div>

            {/* CTA */}
            <div className="px-4 pb-5 pt-3">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {WA_ICON}
                Chat via WhatsApp
              </a>
              <p className="text-blue-200/30 text-xs text-center mt-2.5">
                {online
                  ? "Biasanya kami membalas dalam beberapa menit"
                  : "Kami akan membalas saat online kembali"}
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
            className="flex items-center gap-2.5 glass px-4 py-2.5 rounded-full border border-white/15 shadow-lg hover:border-white/25 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-white text-sm whitespace-nowrap font-medium">Butuh bantuan?</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <div className="relative">
        {!open && (
          <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20 pointer-events-none" />
        )}
        <motion.button
          onClick={() => (open ? setOpen(false) : openChat())}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 flex items-center justify-center transition-colors"
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
                ? <X className="w-5 h-5 text-white" />
                : <MessageCircle className="w-6 h-6 text-white" />
              }
            </motion.span>
          </AnimatePresence>

          {!open && online && (
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#0a1628]" />
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
      <div className="w-7 h-7 rounded-full bg-blue-600/25 flex items-center justify-center text-[11px] font-bold text-blue-300 shrink-0 mt-0.5 select-none">
        MF
      </div>
      <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[210px]">
        <p className="text-white text-sm leading-relaxed">{children}</p>
      </div>
    </motion.div>
  );
}
