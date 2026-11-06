import { AdminSidebar } from "@/app/components/admin-sidebar";
import { requireAdmin } from "@/lib/dal";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
      <AdminSidebar />
      <section className="min-w-0">{children}</section>
    </div>
  );
}