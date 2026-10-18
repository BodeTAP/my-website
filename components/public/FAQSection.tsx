"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import { FadeUp } from "./motion";

const faqs = [
  {
    q: "Berapa lama waktu pengerjaan website?",
    a: "Rata-rata 3-7 hari kerja tergantung paket dan kelengkapan materi seperti foto, teks, dan logo. Landing page biasanya selesai dalam 2-3 hari. Estimasi yang lebih tepat kami berikan setelah konsultasi.",
  },
  {
    q: "Apakah saya perlu paham teknologi atau coding?",
    a: "Tidak perlu. Kami menangani bagian teknis dari awal sampai website live. Setelah selesai, kami berikan panduan singkat supaya Anda bisa memperbarui konten dasar sendiri.",
  },
  {
    q: "Bagaimana jika saya tidak puas dengan desainnya?",
    a: "Setiap paket sudah termasuk revisi. Kami mulai dari brief dan referensi yang Anda berikan, lalu merapikan bagian yang belum cocok sampai arahnya sesuai.",
  },
  {
    q: "Apakah website saya bisa muncul di Google?",
    a: "Ya. Website sudah disiapkan dengan SEO dasar seperti struktur heading, meta tag, kecepatan, sitemap, dan tampilan mobile yang baik. Untuk kata kunci kompetitif, kami bisa lanjutkan dengan layanan SEO bulanan.",
  },
  {
    q: "Apakah ada biaya bulanan setelah website jadi?",
    a: "Paket website mencakup domain dan hosting selama 1 tahun. Setelah itu, biaya perpanjangan biasanya sekitar Rp 400-600 ribu per tahun, tergantung domain dan kebutuhan hosting.",
  },
  {
    q: "Bisakah saya memperbarui konten sendiri setelah website jadi?",
    a: "Bisa. Website dilengkapi dashboard admin untuk mengganti teks, foto, harga, dan informasi umum tanpa bantuan developer.",
  },
  {
    q: "Apakah website tampil baik di HP?",
    a: "Ya. Semua website kami dibangun responsif dan dicek di layar HP, tablet, serta desktop sebelum live.",
  },
  {
    q: "Apa yang terjadi jika ada masalah teknis setelah website live?",
    a: "Kami memberikan support teknis setelah website live. Jika masalahnya berasal dari sisi pengerjaan kami, perbaikan bug tidak dikenakan biaya tambahan.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-slate-100 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full items-start justify-between gap-6 py-5 text-left outline-none"
      >
        <span className={`pr-6 text-base sm:text-lg transition-colors ${open ? "text-slate-950 font-bold" : "text-slate-800 font-medium group-hover:text-slate-950"}`}>
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${open ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-900"}`}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pb-5 pr-8">
              <p className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8 bg-white border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="relative z-10 lg:sticky lg:top-28 lg:col-span-5">
            <FadeUp>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700">
                Pertanyaan Umum
              </div>
              <h2 className="mb-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
                Hal yang biasa ditanyakan sebelum mulai
              </h2>
              <p className="mb-8 max-w-md text-base text-slate-600 leading-relaxed">
                Jawaban ringkas dan transparan tentang proses, alur revisi, hak milik domain, dan bantuan teknis pasca-launch.
              </p>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-7 shadow-xs">
                <h4 className="mb-1.5 font-bold text-slate-900 text-base">Belum menemukan jawaban?</h4>
                <p className="mb-5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Kirim pertanyaan lewat WhatsApp. Kami bantu analisis kebutuhan bisnis Anda terlebih dahulu tanpa tekanan.
                </p>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343"}?text=Halo%20MFWEB%2C%20saya%20ingin%20bertanya%20sebelum%20memesan`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 font-bold text-xs sm:text-sm text-white transition-colors hover:bg-slate-800 shadow-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat via WhatsApp
                </a>
              </div>
            </FadeUp>
          </div>

          <div className="relative z-10 lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
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
