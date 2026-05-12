"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createCreditPackage,
  deleteCreditPackage,
  updateCreditPackage,
  type CreditPackageState,
} from "./actions";

export type AdminCreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonusCredit: number;
  isActive: boolean;
  createdAt: string;
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </Button>
  );
}

function PackageFields({ pkg }: { pkg?: AdminCreditPackage }) {
  return (
    <>
      <input
        name="name"
        required
        defaultValue={pkg?.name}
        placeholder="Nama paket"
        className="h-10 rounded-xl bg-black/35 border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-amber-500/40"
      />
      <input
        name="credits"
        type="number"
        min="1"
        required
        defaultValue={pkg?.credits}
        placeholder="Kredit"
        className="h-10 rounded-xl bg-black/35 border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-amber-500/40"
      />
      <input
        name="bonusCredit"
        type="number"
        min="0"
        required
        defaultValue={pkg?.bonusCredit ?? 0}
        placeholder="Bonus"
        className="h-10 rounded-xl bg-black/35 border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-amber-500/40"
      />
      <input
        name="price"
        type="number"
        min="0"
        required
        defaultValue={pkg?.price}
        placeholder="Harga"
        className="h-10 rounded-xl bg-black/35 border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-amber-500/40"
      />
      <label className="h-10 rounded-xl bg-black/25 border border-white/10 px-3 flex items-center gap-2 text-xs font-bold text-blue-100/70">
        <input name="isActive" type="checkbox" defaultChecked={pkg?.isActive ?? true} className="accent-amber-400" />
        Aktif
      </label>
    </>
  );
}

function PackageRow({ pkg }: { pkg: AdminCreditPackage }) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction] = useActionState<CreditPackageState, FormData>(updateCreditPackage, {});
  const [deleteState, deleteAction] = useActionState<CreditPackageState, FormData>(deleteCreditPackage, {});
  const totalCredits = pkg.credits + pkg.bonusCredit;

  if (editing) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <form action={updateAction} className="space-y-3">
          <input type="hidden" name="id" value={pkg.id} />
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_100px_100px_140px_90px_auto] gap-2">
            <PackageFields pkg={pkg} />
            <SubmitButton className="h-10 rounded-xl bg-amber-500 text-black hover:bg-amber-400 font-bold px-4">
              Simpan
            </SubmitButton>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setEditing(false)} className="text-blue-200/50 hover:text-white text-xs font-bold">
              Batal
            </button>
            {updateState.success && <p className="text-green-300 text-xs">{updateState.success}</p>}
            {updateState.error && <p className="text-red-300 text-xs">{updateState.error}</p>}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-white font-bold">{pkg.name}</p>
          <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest border ${pkg.isActive ? "text-green-300 bg-green-500/10 border-green-500/20" : "text-blue-200/35 bg-white/5 border-white/10"}`}>
            {pkg.isActive ? "Aktif" : "Nonaktif"}
          </span>
        </div>
        <p className="text-blue-200/45 text-xs mt-1">
          {pkg.credits} kredit{pkg.bonusCredit > 0 ? ` + ${pkg.bonusCredit} bonus` : ""} = {totalCredits} kredit
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-amber-300 font-black text-lg">{formatRupiah(pkg.price)}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditing(true)}
          className="h-9 rounded-xl border-white/10 bg-white/5 text-blue-100 hover:bg-white/10"
        >
          <Pencil className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={pkg.id} />
          <input type="hidden" name="name" value={pkg.name} />
          <Button
            type="submit"
            variant="outline"
            onClick={(event) => {
              if (!confirm(`Hapus paket ${pkg.name}?`)) event.preventDefault();
            }}
            className="h-9 rounded-xl border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Hapus
          </Button>
        </form>
      </div>
      {(deleteState.success || deleteState.error) && (
        <p className={`text-xs ${deleteState.error ? "text-red-300" : "text-green-300"}`}>
          {deleteState.error ?? deleteState.success}
        </p>
      )}
    </div>
  );
}

export default function AdminCreditPackageManager({ packages }: { packages: AdminCreditPackage[] }) {
  const [createState, createAction] = useActionState<CreditPackageState, FormData>(createCreditPackage, {});
  const [open, setOpen] = useState(false);

  return (
    <div className="glass rounded-3xl border border-white/5 overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-bold text-lg">Paket Kredit</h2>
          <p className="text-blue-200/45 text-xs mt-1">Tambah, edit, nonaktifkan, atau hapus paket yang tampil di portal klien.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="w-fit inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
          aria-expanded={open}
          aria-controls="admin-credit-package-panel"
        >
          <span>{packages.length} paket</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div id="admin-credit-package-panel">
          <div className="p-5 sm:p-6 border-b border-white/5">
            <form action={createAction} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_100px_100px_140px_90px_auto] gap-2">
                <PackageFields />
                <SubmitButton className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-4">
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </SubmitButton>
              </div>
              {createState.success && <p className="text-green-300 text-xs">{createState.success}</p>}
              {createState.error && <p className="text-red-300 text-xs">{createState.error}</p>}
            </form>
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            {packages.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-black/20 p-8 text-center text-blue-200/35 text-sm">
                Belum ada paket kredit.
              </div>
            ) : (
              packages.map((pkg) => <PackageRow key={pkg.id} pkg={pkg} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
