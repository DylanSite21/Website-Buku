import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { logout } from "@/actions/auth";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-line bg-white">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-brand">
          Buku<span className="text-ink">Ruang</span>
        </Link>
        <div className="flex flex-wrap items-center gap-5 text-sm font-medium">
          <Link className="hover:text-brand" href="/books">Katalog</Link>
          {user?.role === "user" && (
            <>
              <Link className="hover:text-brand" href="/cart">Keranjang</Link>
              <Link className="hover:text-brand" href="/transactions">Pesanan</Link>
              <Link className="hover:text-brand" href="/loans">Peminjaman</Link>
            </>
          )}
          {user?.role === "admin" && (
            <Link className="hover:text-brand" href="/admin">Admin</Link>
          )}
          {user ? (
            <form action={logout}>
              <button className="btn-outline">{user.name} · Keluar</button>
            </form>
          ) : (
            <>
              <Link className="hover:text-brand" href="/login">Masuk</Link>
              <Link className="btn-primary" href="/register">Daftar</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
