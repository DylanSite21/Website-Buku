"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/actions/auth";
import { FormSubmit } from "@/app/components/form-submit";

export default function LoginPage() {
  const [state, formAction] = useActionState(login, {});
  return (
    <section className="mx-auto max-w-md rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Selamat datang kembali</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Masuk ke akun</h1>
      <p className="mt-2 text-sm text-muted">Lanjutkan membaca dan mengelola koleksi Anda.</p>
      <form action={formAction} className="mt-7 space-y-4">
        <label className="block">
          <span className="label">Email</span>
          <input className="input" type="email" name="email" autoComplete="email" required />
        </label>
        <label className="block">
          <span className="label">Kata sandi</span>
          <input className="input" type="password" name="password" autoComplete="current-password" required />
        </label>
        {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        <FormSubmit className="btn-primary w-full">Masuk</FormSubmit>
      </form>
      <p className="mt-6 text-sm text-muted">
        Belum punya akun? <Link href="/register" className="font-semibold text-brand">Daftar</Link>
      </p>
    </section>
  );
}