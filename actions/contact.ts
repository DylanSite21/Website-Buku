"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { requireAdmin, requireUser } from "@/lib/dal";
import type { FormState } from "@/lib/types";

export async function sendContactMessage(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (user.role !== "user") return { error: "Fitur ini hanya tersedia untuk akun pengguna." };

  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (subject.length < 3 || subject.length > 200) {
    return { error: "Subjek harus terdiri dari 3–200 karakter." };
  }
  if (message.length < 10 || message.length > 5000) {
    return { error: "Pesan harus terdiri dari 10–5.000 karakter." };
  }

  await db.insert(contactMessages).values({ userId: user.id, subject, message });
  revalidatePath("/admin/messages");
  return { success: "Pesan berhasil dikirim ke admin." };
}

export async function markContactMessageRead(messageId: string) {
  await requireAdmin();
  await db.update(contactMessages)
    .set({ status: "read", readAt: new Date() })
    .where(eq(contactMessages.id, messageId));
  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}
