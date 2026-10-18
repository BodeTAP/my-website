"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Coins,
  FileText,
  ReceiptText,
  Search,
  Sparkles,
} from "lucide-react";

type GuideSection = {
  id: string;
  icon: typeof BookOpen;
  title: string;
  steps: string[];
  tips?: string[];
};

const guides: GuideSection[] = [
  {
    id: "credits",
    icon: Coins,
    title: "Kredit & Pembayaran",
    steps: [
      "Buka menu Kredit di sidebar untuk melihat saldo dan riwayat transaksi.",
      "Pilih paket kredit yang sesuai kebutuhan, lalu klik Beli.",
      "Selesaikan pembayaran melalui metode yang tersedia (transfer bank, e-wallet, dll).",
      "Kredit otomatis masuk ke saldo setelah pembayaran dikonfirmasi.",
      "Kredit digunakan saat Anda generate proposal, invoice, atau menjalankan Lead Finder.",
    ],
    tips: [
      "Akun baru mendapat bonus kredit gratis untuk mencoba tools.",
      "Kredit tidak memiliki masa kadaluarsa.",
      "Jika generate gagal, kredit otomatis dikembalikan.",
    ],
  },
  {
    id: "lead-finder",
    icon: Search,
    title: "Lead Finder",
    steps: [
      "Buka menu Tools → Lead Finder.",
      "Masukkan kategori bisnis yang dicari (misal: salon, restoran, klinik).",
      "Pilih kota atau area target pencarian.",
      "Pilih mode: Standard (cepat, hasil terbatas) atau Deep Search (lebih luas).",
      "Klik Cari — hasil akan muncul dalam bentuk tabel.",
      "Filter hasil berdasarkan rating, nomor telepon, atau status bisnis.",
      "Simpan list untuk dibuka kembali nanti tanpa biaya kredit tambahan.",
      "Export hasil ke CSV untuk kebutuhan follow-up.",
    ],
    tips: [
      "Standard Search cocok untuk pencarian cepat di satu area.",
      "Deep Search menjalankan variasi kata kunci dan area untuk hasil lebih banyak.",
      "Social Scan (opsional) akan mencari link Instagram, Facebook, dll dari website prospek.",
      "List yang sudah disimpan bisa dibuka ulang tanpa biaya kredit.",
    ],
  },
  {
    id: "proposal",
    icon: FileText,
    title: "Proposal Generator",
    steps: [
      "Buka menu Tools → Proposal Generator.",
      "Pilih template yang sesuai (Sales, Partnership, atau Program).",
      "Isi brief: nama calon klien, nama bisnis, dan field sesuai template.",
      "Periksa preview di panel kanan — pastikan data sudah benar.",
      "Klik Generate Proposal — kredit akan dipotong dan proposal tersimpan.",
      "Setelah generate, Anda bisa melihat preview PDF langsung di halaman.",
      "Klik Download PDF untuk mengunduh, atau Kirim WhatsApp untuk mengirim ke prospek.",
      "Ubah status proposal (Draft → Terkirim → Diterima/Ditolak) untuk tracking.",
    ],
    tips: [
      "Atur Brand Kit (logo, warna, font) di tab Desain agar proposal konsisten.",
      "Gunakan Duplikasi untuk membuat proposal serupa tanpa biaya kredit tambahan.",
      "Template bisa diduplikasi dan diedit sesuai kebutuhan bisnis Anda.",
      "Pastikan semua field terisi sebelum generate — field kosong akan tampil kosong di PDF.",
    ],
  },
  {
    id: "invoice",
    icon: ReceiptText,
    title: "Invoice Generator",
    steps: [
      "Buka menu Tools → Invoice Generator.",
      "Isi data pengirim (otomatis dari profil) dan data penerima invoice.",
      "Tambahkan item layanan: deskripsi, quantity, dan harga per item.",
      "Atur diskon (opsional) dan pilih apakah menyertakan PPN 11%.",
      "Periksa preview realtime di panel kanan — pastikan total sudah benar.",
      "Klik Buat Invoice — kredit akan dipotong dan invoice tersimpan.",
      "Download PDF dari tombol di bar atas atau dari halaman detail.",
      "Ubah status invoice (Draft → Terkirim → Lunas/Void) untuk tracking.",
    ],
    tips: [
      "Atur Template Desain (logo, warna, layout) di tab Template Desain.",
      "Gunakan Duplikasi di halaman detail untuk membuat invoice serupa.",
      "Preview realtime berubah langsung saat Anda edit form — tanpa biaya kredit.",
      "Invoice yang sudah dibuat tidak bisa diedit. Gunakan Duplikasi jika perlu perubahan.",
      "Footer dan catatan bisa diisi dengan instruksi pembayaran atau nomor rekening.",
    ],
  },
];

export default function HelpGuide() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-slate-900 font-bold text-sm">Panduan Penggunaan Tools</h3>
          <p className="text-slate-500 text-xs">Pilih topik di bawah ini untuk melihat panduan langkah demi langkah</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {guides.map((guide) => {
          const isOpen = openSection === guide.id;
          const Icon = guide.icon;

          return (
            <div key={guide.id}>
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : guide.id)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-xs sm:text-sm font-semibold text-slate-800">{guide.title}</span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 space-y-4 bg-slate-50/40">
                  {/* Steps */}
                  <div className="space-y-2.5 pl-2 sm:pl-11">
                    {guide.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[#1E242E] text-white flex items-center justify-center text-[10px] font-bold mt-0.5 shadow-2xs">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  {guide.tips && guide.tips.length > 0 && (
                    <div className="ml-0 sm:ml-11 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 space-y-1.5 shadow-2xs">
                      <p className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Tips Praktis
                      </p>
                      {guide.tips.map((tip, idx) => (
                        <p key={idx} className="text-xs text-amber-950 leading-relaxed font-medium">• {tip}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
