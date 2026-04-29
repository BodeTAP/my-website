"use client";

import { useState, useCallback, type ReactNode } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

type Options = {
  description?:  string;
  confirmLabel?: string;
  variant?:      "danger" | "warning";
};

type State = {
  message: string;
  options: Options;
  resolve: (v: boolean) => void;
};

export function useConfirm() {
  const [state, setState] = useState<State | null>(null);

  const confirm = useCallback(
    (message: string, options: Options = {}): Promise<boolean> =>
      new Promise(resolve => setState({ message, options, resolve })),
    [],
  );

  const node: ReactNode = state ? (
    <ConfirmDialog
      message={state.message}
      description={state.options.description}
      confirmLabel={state.options.confirmLabel}
      variant={state.options.variant}
      onConfirm={() => { state.resolve(true);  setState(null); }}
      onCancel={() =>  { state.resolve(false); setState(null); }}
    />
  ) : null;

  return { confirm, node };
}
