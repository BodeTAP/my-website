"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "./motion";

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
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={`glass rounded-2xl overflow-hidden transition-colors duration-300 ${
        open ? "border-blue-500/30" : "hover:border-blue-500/20"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
      >
        <span className="text-white font-medium text-sm sm:text-base leading-snug group-hover:text-blue-200 transition-colors">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            open ? "bg-blue-600 text-white" : "bg-white/5 text-blue-400 group-hover:bg-white/10"
          }`}
        >
          {open ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
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
            <div className="px-6 pb-5 border-t border-white/5">
              <p className="text-blue-200/70 text-sm leading-relaxed pt-4">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <FadeUp className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-blue-300 mb-6 border border-blue-500/20">
            Pertanyaan Umum
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ada yang Ingin{" "}
            <span className="text-gradient">Anda Tanyakan?</span>
          </h2>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Pertanyaan yang paling sering ditanyakan sebelum klien memutuskan untuk bekerja sama dengan kami.
          </p>
        </FadeUp>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>

        <FadeUp delay={0.3} className="mt-10 text-center">
          <p className="text-blue-200/50 text-sm mb-4">
            Masih ada pertanyaan lain? Kami siap menjawab langsung.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281234567890"}?text=Halo%20MFWEB%2C%20saya%20ingin%20bertanya%20sebelum%20memesan`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            💬 Tanya via WhatsApp
          </a>
        </FadeUp>
      </div>
    </section>
  );
}
