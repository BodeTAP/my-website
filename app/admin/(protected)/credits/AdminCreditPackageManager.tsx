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
        className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
      />
      <input
        name="credits"
        type="number"
        min="1"
        required
        defaultValue={pkg?.credits}
        placeholder="Kredit"
        className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
      />
      <input
        name="bonusCredit"
        type="number"
        min="0"
        required
        defaultValue={pkg?.bonusCredit ?? 0}
        placeholder="Bonus"
        className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
      />
      <input
        name="price"
        type="number"
        min="0"
        required
        defaultValue={pkg?.price}
        placeholder="Harga"
        className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
      />
      <label className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 flex items-center gap-2 text-xs font-semibold text-slate-700">
        <input name="isActive" type="checkbox" defaultChecked={pkg?.isActive ?? true} className="accent-slate-900" />
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
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <form action={updateAction} className="space-y-3">
          <input type="hidden" name="id" value={pkg.id} />
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_100px_100px_140px_90px_auto] gap-2">
            <PackageFields pkg={pkg} />
            <SubmitButton className="h-10 rounded-xl bg-[#1E242E] text-white hover:bg-slate-800 shadow-xs font-semibold px-4">
              Simpan
            </SubmitButton>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setEditing(false)} className="text-slate-500 hover:text-slate-800 text-xs font-semibold">
              Batal
            </button>
            {updateState.success && <p className="text-emerald-700 text-xs font-medium">{updateState.success}</p>}
            {updateState.error && <p className="text-rose-700 text-xs font-medium">{updateState.error}</p>}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-slate-900 font-bold">{pkg.name}</p>
          <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${pkg.isActive ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-500 bg-slate-100 border-slate-200"}`}>
            {pkg.isActive ? "Aktif" : "Nonaktif"}
          </span>
        </div>
        <p className="text-slate-500 text-xs mt-1">
          {pkg.credits} kredit{pkg.bonusCredit > 0 ? ` + ${pkg.bonusCredit} bonus` : ""} = {totalCredits} kredit
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-slate-900 font-bold text-lg">{formatRupiah(pkg.price)}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditing(true)}
          className="h-9 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900"
        >
          <Pencil className="w-4 h-4 mr-1 text-slate-500" />
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
            className="h-9 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Hapus
          </Button>
        </form>
      </div>
      {(deleteState.success || deleteState.error) && (
        <p className={`text-xs font-medium ${deleteState.error ? "text-rose-700" : "text-emerald-700"}`}>
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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-slate-900 font-bold text-lg">Paket Kredit</h2>
          <p className="text-slate-500 text-xs mt-1">Tambah, edit, nonaktifkan, atau hapus paket yang tampil di portal klien.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="w-fit inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
          aria-expanded={open}
          aria-controls="admin-credit-package-panel"
        >
          <span>{packages.length} paket</span>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div id="admin-credit-package-panel">
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/40">
            <form action={createAction} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_100px_100px_140px_90px_auto] gap-2">
                <PackageFields />
                <SubmitButton className="h-10 rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white shadow-xs font-semibold px-4">
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </SubmitButton>
              </div>
              {createState.success && <p className="text-emerald-700 text-xs font-medium">{createState.success}</p>}
              {createState.error && <p className="text-rose-700 text-xs font-medium">{createState.error}</p>}
            </form>
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            {packages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-8 text-center text-slate-400 text-sm">
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
