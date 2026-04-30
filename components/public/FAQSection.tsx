"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import { FadeUp } from "./motion";

const faqs = [
  {
    q: "Berapa lama waktu pengerjaan website?",
    a: "Rata-rata 3–7 hari kerja tergantung paket dan kelengkapan materi dari Anda (foto, teks, logo). Landing page biasanya selesai dalam 2–3 hari. Kami akan memberikan estimasi tepat setelah konsultasi.",
  },
  {
    q: "Apakah saya perlu paham teknologi atau coding?",
    a: "Tidak perlu sama sekali. Kami menangani semua hal teknis dari awal sampai website Anda live. Setelah selesai, kami juga memberikan panduan singkat cara memperbarui konten jika diperlukan.",
  },
  {
    q: "Bagaimana jika saya tidak puas dengan desainnya?",
    a: "Setiap paket sudah termasuk revisi. Kami mengerjakan berdasarkan brief dan referensi yang Anda berikan, sehingga hasilnya sesuai ekspektasi. Jika ada yang kurang cocok, kami perbaiki sampai Anda puas.",
  },
  {
    q: "Apakah website saya bisa muncul di Google?",
    a: "Ya. Semua website yang kami buat sudah dioptimasi SEO dasar: struktur halaman yang benar, meta tag, kecepatan loading, dan mobile-friendly — faktor utama yang dipertimbangkan Google. Untuk hasil pencarian kompetitif, kami juga menyediakan layanan SEO lanjutan.",
  },
  {
    q: "Apakah ada biaya bulanan setelah website jadi?",
    a: "Harga paket sudah mencakup domain dan hosting selama 1 tahun. Setelah tahun pertama, biaya perpanjangan hosting dan domain sekitar Rp 400–600 ribu per tahun — jauh lebih murah dari biaya promosi platform lain.",
  },
  {
    q: "Bisakah saya memperbarui konten sendiri setelah website jadi?",
    a: "Bisa. Website Anda dilengkapi dashboard admin sehingga Anda bisa mengganti teks, foto, harga, dan informasi lainnya sendiri tanpa bantuan developer. Kami sediakan panduan penggunaannya.",
  },
  {
    q: "Apakah website tampil baik di HP?",
    a: "100%. Semua website kami dibangun dengan desain responsif — tampilan otomatis menyesuaikan layar HP, tablet, maupun desktop. Lebih dari 70% pengunjung datang dari HP, jadi ini prioritas utama kami.",
  },
  {
    q: "Apa yang terjadi jika ada masalah teknis setelah website live?",
    a: "Kami memberikan support teknis setelah website live. Jika ada bug atau masalah yang disebabkan dari sisi kami, kami perbaiki tanpa biaya tambahan. Anda cukup hubungi kami via WhatsApp.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-white/10 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-6 py-6 text-left group outline-none"
      >
        <span className={`font-medium text-base sm:text-lg transition-colors duration-300 pr-8 ${open ? "text-white" : "text-blue-100/70 group-hover:text-blue-100"}`}>
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${open ? "bg-blue-600/20 text-blue-400" : "bg-white/5 text-blue-100/50 group-hover:bg-white/10 group-hover:text-white"}`}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pb-6 pr-12">
              <p className="text-blue-200/60 leading-relaxed text-sm sm:text-base">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      {/* Subtle background glow for the FAQ section */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Side: Sticky Title & CTA */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 relative z-10">
            <FadeUp>
              <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-blue-300 mb-6 border border-blue-500/20">
                Pertanyaan Umum
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Ada yang Ingin <br className="hidden lg:block"/>
                <span className="text-gradient">Anda Tanyakan?</span>
              </h2>
              <p className="text-blue-200/60 text-lg mb-10 max-w-md">
                Kami telah merangkum jawaban atas pertanyaan yang paling sering ditujukan oleh klien kami sebelum memulai proyek.
              </p>
              
              <div className="glass rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
                <h4 className="text-white font-semibold mb-2">Belum menemukan jawaban?</h4>
                <p className="text-sm text-blue-200/60 mb-6">Jangan ragu untuk menghubungi tim kami secara langsung. Konsultasi 100% gratis.</p>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343"}?text=Halo%20MFWEB%2C%20saya%20ingin%20bertanya%20sebelum%20memesan`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat via WhatsApp
                </a>
              </div>
            </FadeUp>
          </div>

          {/* Right Side: Accordion List */}
          <div className="lg:col-span-7 relative z-10 lg:pl-10">
            <div className="bg-[#050b14]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl">
              {faqs.map((faq, i) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
