"use client";

import { useFormStatus } from "react-dom";

export function FormSubmit({
  children,
  className = "btn-primary",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending}>
      {pending ? "Memproses..." : children}
    </button>
  );
}
