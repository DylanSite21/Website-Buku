"use client";

import { useActionState } from "react";
import { uploadPaymentProof } from "@/actions/transactions";
import { FormSubmit } from "@/app/components/form-submit";

export function PaymentProofForm({ transactionId }: { transactionId: string }) {
  const [state, action] = useActionState(uploadPaymentProof.bind(null, transactionId), {});
  return (
    <form action={action} className="space-y-3 rounded-xl bg-amber-50 p-5">
      <div>
        <h2 className="font-bold">Kirim bukti transfer</h2>
        <p className="mt-1 text-sm text-muted">Gunakan gambar JPG, PNG, atau WebP maksimal 5 MB.</p>
      </div>
      <input className="input" type="file" name="proof" accept="image/jpeg,image/png,image/webp" required />
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-700">{state.success}</p>}
      <FormSubmit>Kirim bukti</FormSubmit>
    </form>
  );
}
