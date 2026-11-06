import { getCurrentUser } from "@/lib/dal";
import Link from "next/link";
import { ResponsiveNavbar } from "@/app/components/responsive-navbar";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-line bg-white">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-brand">
          Buku<span className="text-ink">Ruang</span>
        </Link>
        <ResponsiveNavbar user={user ? { name: user.name, role: user.role } : null} />
      </nav>
    </header>
  );
}
