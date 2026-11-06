import Link from "next/link";
import { ActionFeedback } from "@/app/components/action-feedback";
import { sendContactMessage } from "@/actions/contact";
import { getCurrentUser } from "@/lib/dal";

export const metadata = {
  title: "Hubungi Admin",
  description: "Kirim pertanyaan atau masukan kepada admin BukuRuang.",
};

export default async function ContactPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Bantuan</p>
        <h1 className="mt-2 text-4xl font-bold">Hubungi Admin</h1>
        <p className="mt-3 leading-7 text-muted">
          Ada pertanyaan atau kendala? Kirim pesan dan admin akan meninjaunya.
        </p>
      </div>
      {!user ? (
        <section className="rounded-xl border border-line bg-white p-6">
          <p className="text-muted">Silakan masuk ke akun Anda untuk mengirim pesan kepada admin.</p>
          <Link className="btn-primary mt-4 inline-block" href="/login">Masuk</Link>
        </section>
      ) : user.role !== "user" ? (
        <section className="rounded-xl border border-line bg-white p-6">
          <p className="text-muted">Formulir ini tersedia untuk akun pengguna.</p>
        </section>
      ) : (
        <section className="rounded-xl border border-line bg-white p-6">
          <p className="mb-5 text-sm text-muted">Pesan dikirim sebagai {user.name} ({user.email}).</p>
          <ActionFeedback action={sendContactMessage} submitLabel="Kirim pesan">
            <label className="block">
              <span className="label">Subjek</span>
              <input className="input" name="subject" minLength={3} maxLength={200} required />
            </label>
            <label className="block">
              <span className="label">Pesan</span>
              <textarea className="input min-h-40" name="message" minLength={10} maxLength={5000} required />
            </label>
          </ActionFeedback>
        </section>
      )}
    </div>
  );
}
