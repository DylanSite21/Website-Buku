"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/actions/auth";
import { SubmitButton } from "../components/submit-button";

export default function RegisterPage() {
  const [state, action] = useActionState(register, undefined);

  return (
    <div className="mx-auto max-w-sm rounded-lg border border-line bg-white p-6">
      <h1 className="mb-4 text-2xl font-bold">Buat akun</h1>
      <form action={action} className="space-y-4">
        {state?.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        <div>
          <label className="label" htmlFor="name">
            Nama lengkap
          </label>
          <input id="name" name="name" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Kata sandi
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={6}
            className="input"
            required
          />
        </div>
        <SubmitButton>Daftar</SubmitButton>
      </form>
      <p className="mt-4 text-sm text-muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-brand underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
