"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Client = { id: string; businessName: string; user: { name: string | null; email: string } };

function generateInvoiceNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900) + 100;
  return `INV-${y}${m}-${rand}`;
}

function formatRupiah(val: string) {
  const num = val.replace(/\D/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("id-ID");
}

export default function NewInvoiceModal({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rawAmount, setRawAmount] = useState("");

  const [form, setForm] = useState({
    clientId: "",
    invoiceNo: generateInvoiceNo(),
    description: "",
    dueDate: "",
    whatsappMsg: "",
  });

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleOpen = () => {
    setForm((f) => ({ ...f, invoiceNo: generateInvoiceNo() }));
    setRawAmount("");
    setError("");
    setOpen(true);
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    const client = clients.find((c) => c.id === clientId);
    setForm((f) => ({
      ...f,
      clientId,
      whatsappMsg: client
        ? `Halo ${client.user.name ?? client.businessName}, berikut tagihan ${f.invoiceNo} dari Victoria Tech. Mohon segera dikonfirmasi pembayarannya. Terima kasih.`
        : f.whatsappMsg,
    }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setRawAmount(raw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!rawAmount || Number(rawAmount) <= 0) {
      setError("Jumlah tagihan wajib diisi.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(rawAmount) }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Gagal membuat invoice.");
      setLoading(false);
      return;
    }

    setOpen(false);
    setLoading(false);
    router.refresh();
  };

  return (
    <>
      <Button onClick={handleOpen} className="bg-blue-600 hover:bg-blue-500 text-white">
        <Plus className="w-4 h-4 mr-2" />
        Invoice Baru
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal */}
          <div className="relative glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-white font-bold text-lg">Invoice Baru</h2>
              <button onClick={() => setOpen(false)} className="text-blue-200/50 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Klien */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Klien *</Label>
                <select
                  required
                  value={form.clientId}
                  onChange={handleClientChange}
                  className="w-full h-10 rounded-lg px-3 text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="" className="bg-[#0d1b35]">— Pilih klien —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0d1b35]">
                      {c.businessName} ({c.user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* No. Invoice */}
                <div className="space-y-1.5">
                  <Label className="text-blue-200 text-sm">No. Invoice *</Label>
                  <Input
                    required
                    value={form.invoiceNo}
                    onChange={set("invoiceNo")}
                    className="bg-white/5 border-white/10 text-white font-mono text-sm"
                  />
                </div>

                {/* Jatuh tempo */}
                <div className="space-y-1.5">
                  <Label className="text-blue-200 text-sm">Jatuh Tempo</Label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={set("dueDate")}
                    className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Jumlah */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Jumlah Tagihan (Rp) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/50 text-sm">Rp</span>
                  <Input
                    required
                    value={rawAmount ? formatRupiah(rawAmount) : ""}
                    onChange={handleAmountChange}
                    placeholder="1.500.000"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Deskripsi Tagihan</Label>
                <Input
                  value={form.description}
                  onChange={set("description")}
                  placeholder="DP 50% pembuatan website..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                />
              </div>

              {/* Pesan WhatsApp */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">
                  Pesan WhatsApp
                  <span className="text-blue-200/30 text-xs ml-1">(otomatis saat tagih)</span>
                </Label>
                <Textarea
                  value={form.whatsappMsg}
                  onChange={set("whatsappMsg")}
                  rows={3}
                  placeholder="Pilih klien untuk mengisi otomatis..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none text-sm"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buat Invoice"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
