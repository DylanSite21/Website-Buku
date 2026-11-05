"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/types";

export function ActionFeedback({
  action,
  children,
  submitLabel = "Simpan",
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      {children}
      {state.error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{state.success}</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "Memproses..." : submitLabel}</button>
    </form>
  );
}
