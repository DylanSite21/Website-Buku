import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="overflow-hidden rounded-3xl bg-ink px-7 py-14 text-white sm:px-14 sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Toko buku & perpustakaan</p>
        <div className="mt-5 grid gap-10 md:grid-cols-[1.4fr_0.6fr] md:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
              Temukan cerita berikutnya. <span className="text-emerald-300">Baca dengan cara Anda.</span>
            </h1>
            <p className="mt-6 max-w-xl leading-7 text-white/70">
              Jelajahi koleksi pilihan, beli buku favorit, atau pinjam untuk membaca lebih lama.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/books" className="rounded-md bg-emerald-300 px-5 py-3 text-sm font-bold text-ink hover:bg-emerald-200">Jelajahi katalog</Link>
              <Link href="/register" className="rounded-md border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/10">Buat akun</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-5"><p className="text-3xl font-bold">01</p><p className="mt-2 text-sm text-white/70">Katalog terkurasi</p></div>
            <div className="mt-8 rounded-2xl bg-emerald-300 p-5 text-ink"><p className="text-3xl font-bold">02</p><p className="mt-2 text-sm">Beli atau pinjam</p></div>
          </div>
        </div>
      </section>
      <section className="grid gap-5 md:grid-cols-3">
        {[
          ["Koleksi pilihan", "Cari buku berdasarkan judul, penulis, ISBN, dan kategori."],
          ["Belanja mudah", "Keranjang belanja, invoice, dan konfirmasi pembayaran transfer."],
          ["Pinjam terkelola", "Pantau persetujuan, masa pinjam, serta riwayat pengembalian."],
        ].map(([title, text], index) => (
          <article key={title} className="rounded-xl border border-line bg-white p-6">
            <span className="text-sm font-bold text-brand">0{index + 1}</span>
            <h2 className="mt-4 text-xl font-bold">{title}</h2>
            <p className="mt-2 leading-6 text-muted">{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
