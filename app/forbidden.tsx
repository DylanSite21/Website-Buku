import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";

export default async function ForbiddenPage() {
  const user = await getCurrentUser();

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8 text-center shadow-sm sm:p-12">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
        Forbidden Error 403
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
        {user ? "Akses ditolak" : "Silakan masuk terlebih dahulu"}
      </h1>
      <p className="mt-3 leading-7 text-muted">
        {user
          ? "Akun Anda tidak memiliki izin untuk membuka halaman ini."
          : "Anda perlu masuk ke akun untuk membuka halaman ini."}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {user ? (
          <Link href="/" className="btn-primary">
            Kembali ke beranda
          </Link>
        ) : (
          <>
            <Link href="/login" className="btn-primary">
              Masuk
            </Link>
            <Link href="/register" className="btn-outline">
              Daftar
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
