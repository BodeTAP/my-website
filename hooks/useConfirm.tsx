"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AnimatePresence } from "framer-motion";

type Options = {
  description?:  string;
  confirmLabel?: string;
  variant?:      "danger" | "warning" | "info";
};

type State = {
  message: string;
  options: Options;
  resolve: (v: boolean) => void;
};

export function useConfirm() {
  const [state, setState] = useState<State | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const confirm = useCallback(
    (message: string, options: Options = {}): Promise<boolean> =>
      new Promise(resolve => setState({ message, options, resolve })),
    [],
  );

  const dialog = (
    <AnimatePresence>
      {state && (
        <ConfirmDialog
          message={state.message}
          description={state.options.description}
          confirmLabel={state.options.confirmLabel}
          variant={state.options.variant}
          onConfirm={() => { state.resolve(true);  setState(null); }}
          onCancel={() =>  { state.resolve(false); setState(null); }}
        />
      )}
    </AnimatePresence>
  );

  // Render via portal to document.body to escape any stacking context / overflow:hidden
  const node: ReactNode = mounted ? createPortal(dialog, document.body) : null;

  return { confirm, node };
}
