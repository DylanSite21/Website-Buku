import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8 text-center shadow-sm sm:p-12">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
        Unauthorized Error 401
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
        {"Silakan masuk terlebih dahulu"}
      </h1>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <>
          <Link href="/login" className="btn-primary">
            Masuk
          </Link>
          <Link href="/register" className="btn-outline">
            Daftar
          </Link>
        </>
      </div>
    </section>
  );
}
