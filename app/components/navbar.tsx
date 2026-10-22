import Link from "next/link";
import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/dal";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-line bg-white">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="font-display text-xl font-bold text-brand">
          Perpustakaan
        </Link>
        <Link href="/" className="text-sm text-muted hover:text-ink">
          Katalog
        </Link>
        {user?.role === "user" && (
          <Link href="/loans" className="text-sm text-muted hover:text-ink">
            Pinjaman saya
          </Link>
        )}
        {user?.role === "admin" && (
          <Link href="/admin" className="text-sm text-muted hover:text-ink">
            Panel admin
          </Link>
        )}

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm">{user.name}</span>
              <form action={logout}>
                <button className="btn-outline">Keluar</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline">
                Masuk
              </Link>
              <Link href="/register" className="btn-primary">
                Daftar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
