import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Kenali BukuRuang, ruang untuk menemukan, membeli, dan meminjam buku.",
};

const services = [
  {
    number: "01",
    title: "Temukan bacaan",
    description: "Jelajahi katalog dan cari buku berdasarkan judul, penulis, ISBN, atau kategori.",
  },
  {
    number: "02",
    title: "Beli buku pilihan",
    description: "Simpan buku di keranjang, checkout, lalu ikuti status pesanan dari akun Anda.",
  },
  {
    number: "03",
    title: "Ajukan peminjaman",
    description: "Pilih buku yang tersedia untuk dipinjam dan pantau pengajuan serta masa pinjam.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-3xl bg-ink px-7 py-12 text-white sm:px-14 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Tentang BukuRuang</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          Satu ruang untuk menemukan cerita dan berbagi bacaan.
        </h1>
        <p className="mt-6 max-w-2xl leading-7 text-white/70">
          BukuRuang adalah platform toko buku dan perpustakaan yang membantu Anda menjelajahi koleksi,
          membeli buku favorit, atau mengajukan peminjaman dengan mudah.
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Cerita kami</p>
          <h2 className="mt-2 text-3xl font-bold">Membuat akses buku lebih sederhana</h2>
        </div>
        <div className="space-y-4 leading-7 text-muted">
          <p>
            Kami percaya menemukan buku yang tepat seharusnya terasa mudah. Karena itu, BukuRuang
            menyatukan katalog, pembelian, dan peminjaman dalam satu tempat.
          </p>
          <p>
            Pengguna dapat mencari buku, mengelola keranjang, melihat pesanan, serta memantau
            pengajuan peminjaman. Admin membantu menjaga data buku dan kategori, stok, akun, dan
            pesanan tetap terkelola.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Layanan</p>
          <h2 className="mt-2 text-3xl font-bold">Pilih cara membaca Anda</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {services.map((service) => (
            <article key={service.number} className="rounded-xl border border-line bg-white p-6">
              <span className="text-sm font-bold text-brand">{service.number}</span>
              <h3 className="mt-4 text-xl font-bold">{service.title}</h3>
              <p className="mt-2 leading-6 text-muted">{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-line bg-white p-6 sm:p-8">
        <div>
          <h2 className="text-2xl font-bold">Siap menemukan bacaan berikutnya?</h2>
          <p className="mt-2 text-muted">Jelajahi katalog BukuRuang dan temukan buku yang cocok untuk Anda.</p>
        </div>
        <Link href="/books" className="btn-primary">Jelajahi katalog</Link>
      </section>
    </div>
  );
}
