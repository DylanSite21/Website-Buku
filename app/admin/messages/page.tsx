import { desc, eq } from "drizzle-orm";
import { markContactMessageRead } from "@/actions/contact";
import { db } from "@/lib/db";
import { contactMessages, users } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const rows = await db.select({ message: contactMessages, user: users })
    .from(contactMessages)
    .innerJoin(users, eq(users.id, contactMessages.userId))
    .orderBy(desc(contactMessages.createdAt));

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Komunikasi</p>
        <h1 className="mt-2 text-4xl font-bold">Pesan dari pengguna</h1>
      </div>
      {rows.length ? rows.map(({ message, user }) => (
        <article key={message.id} className="space-y-4 rounded-xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted">{formatDate(message.createdAt)}</p>
              <h2 className="mt-1 text-lg font-bold">{message.subject}</h2>
              <p className="text-sm text-muted">{user.name} · {user.email}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${message.status === "unread" ? "bg-amber-100 text-amber-900" : "bg-gray-100 text-gray-700"}`}>
              {message.status === "unread" ? "Belum dibaca" : "Sudah dibaca"}
            </span>
          </div>
          <p className="whitespace-pre-wrap break-words leading-7">{message.message}</p>
          {message.status === "unread" && (
            <form action={markContactMessageRead.bind(null, message.id)}>
              <button className="btn-outline">Tandai sudah dibaca</button>
            </form>
          )}
        </article>
      )) : (
        <p className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-muted">
          Belum ada pesan dari pengguna.
        </p>
      )}
    </div>
  );
}
