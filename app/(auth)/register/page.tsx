"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/actions/auth";
import { FormSubmit } from "@/app/components/form-submit";

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, {});
  return (
    <section className="mx-auto max-w-md rounded-xl border border-line bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Bergabung bersama kami</p>
      <h1 className="mt-2 text-3xl font-bold">Buat akun</h1>
      <p className="mt-2 text-sm text-muted">Satu akun untuk berbelanja dan meminjam buku.</p>
      <form action={formAction} className="mt-7 space-y-4">
        <label className="block">
          <span className="label">Nama lengkap</span>
          <input className="input" name="name" autoComplete="name" minLength={3} maxLength={255} required />
        </label>
        <label className="block">
          <span className="label">Email</span>
          <input className="input" type="email" name="email" autoComplete="email" required />
        </label>
        <label className="block">
          <span className="label">Kata sandi</span>
          <input className="input" type="password" name="password" autoComplete="new-password" minLength={10} required />
          <span className="mt-1 block text-xs text-muted">Minimal 10 karakter.</span>
        </label>
        {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        <FormSubmit className="btn-primary w-full">Buat akun</FormSubmit>
      </form>
      <p className="mt-6 text-sm text-muted">
        Sudah memiliki akun? <Link href="/login" className="font-semibold text-brand">Masuk</Link>
      </p>
    </section>
  );
}