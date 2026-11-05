"use client";

import { useActionState } from "react";
import { checkout } from "@/actions/cart";
import { FormSubmit } from "@/app/components/form-submit";

export function CheckoutForm() {
  const [state, action] = useActionState(checkout, {});
  return (
    <form action={action} className="space-y-3">
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <FormSubmit className="btn-primary w-full">Lanjutkan checkout</FormSubmit>
    </form>
  );
}
