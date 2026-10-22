import Link from "next/link";
import { requireAdmin } from "@/lib/dal";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <nav className="flex gap-4 border-b border-line pb-3 text-sm">
        <Link href="/admin" className="font-medium hover:text-brand">
          Ringkasan
        </Link>
        <Link href="/admin/books" className="font-medium hover:text-brand">
          Kelola buku
        </Link>
      </nav>
      {children}
    </div>
  );
}
