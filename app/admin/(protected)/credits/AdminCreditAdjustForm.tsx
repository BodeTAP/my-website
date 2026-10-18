"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adjustCredits, type CreditAdjustState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-10 rounded-xl bg-[#1E242E] text-white hover:bg-slate-800 shadow-xs font-semibold px-4"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
    </Button>
  );
}

export default function AdminCreditAdjustForm({
  clientId,
  clientName,
  mobile = false,
}: {
  clientId: string;
  clientName: string;
  mobile?: boolean;
}) {
  const [state, formAction] = useActionState<CreditAdjustState, FormData>(adjustCredits, {});

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="clientName" value={clientName} />
      <div className={mobile ? "grid grid-cols-1 gap-2" : "grid grid-cols-[92px_92px_1fr_auto] gap-2"}>
        <select name="type" className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:bg-white focus:ring-1 focus:ring-slate-900">
          <option value="TOPUP">Topup</option>
          <option value="REFUND">Refund</option>
        </select>
        <input
          name="amount"
          type="number"
          min="1"
          required
          placeholder="Kredit"
          className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
        />
        <input
          name="description"
          placeholder="Catatan"
          className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
        />
        <SubmitButton />
      </div>
      {state.success && <p className="text-emerald-700 text-xs font-medium leading-relaxed">{state.success}</p>}
      {state.error && <p className="text-rose-700 text-xs font-medium leading-relaxed">{state.error}</p>}
    </form>
  );
}
