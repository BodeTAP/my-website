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
      className="border-b border-white/10 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full items-start justify-between gap-6 py-6 text-left outline-none"
      >
        <span className={`pr-6 text-base font-medium transition-colors sm:text-lg ${open ? "text-white" : "text-blue-100/75 group-hover:text-blue-100"}`}>
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${open ? "bg-blue-600/20 text-blue-300" : "bg-white/5 text-blue-100/50 group-hover:bg-white/10 group-hover:text-white"}`}
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
            <div className="pb-6 pr-12">
              <p className="text-sm leading-relaxed text-blue-200/60 sm:text-base">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="relative z-10 lg:sticky lg:top-32 lg:col-span-5">
            <FadeUp>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#071225] px-4 py-1.5 text-xs text-blue-200/70">
                Pertanyaan Umum
              </div>
              <h2 className="mb-6 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Hal yang biasa ditanyakan sebelum mulai
              </h2>
              <p className="mb-10 max-w-md text-lg text-blue-200/60">
                Jawaban singkat soal proses, biaya, revisi, dan support setelah website selesai.
              </p>

              <div className="rounded-2xl border border-white/10 bg-[#071225] p-7">
                <h4 className="mb-2 font-semibold text-white">Belum menemukan jawaban?</h4>
                <p className="mb-6 text-sm text-blue-200/60">
                  Kirim pertanyaan lewat WhatsApp. Kami bantu cek kebutuhan Anda dulu sebelum bicara paket.
                </p>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343"}?text=Halo%20MFWEB%2C%20saya%20ingin%20bertanya%20sebelum%20memesan`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-blue-500"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat via WhatsApp
                </a>
              </div>
            </FadeUp>
          </div>

          <div className="relative z-10 lg:col-span-7 lg:pl-10">
            <div className="rounded-2xl border border-white/10 bg-[#06111f] p-6 sm:p-10">
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
