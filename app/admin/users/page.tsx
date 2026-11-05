import { asc } from "drizzle-orm";
import { toggleUserStatus } from "@/actions/admin";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const rows = await db.select({
    id: users.id, name: users.name, email: users.email, role: users.role,
    isActive: users.isActive, createdAt: users.createdAt,
  }).from(users).orderBy(asc(users.name));
  return (
    <div className="space-y-7">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Akses</p><h1 className="mt-2 text-4xl font-bold">Pengguna</h1></div>
      {error === "self" && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">Admin tidak dapat menonaktifkan akunnya sendiri.</p>}
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-gray-50 text-muted"><tr><th className="p-4">Nama</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4"></th></tr></thead>
          <tbody>{rows.map((user) => <tr key={user.id} className="border-t border-line"><td className="p-4 font-semibold">{user.name}</td><td className="p-4">{user.email}</td><td className="p-4">{user.role}</td><td className="p-4">{user.isActive ? "Aktif" : "Nonaktif"}</td><td className="p-4">{user.role === "user" && <form action={toggleUserStatus.bind(null, user.id)}><button className={user.isActive ? "btn-danger" : "btn-outline"}>{user.isActive ? "Nonaktifkan" : "Aktifkan"}</button></form>}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
