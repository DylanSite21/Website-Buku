"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, deleteSession } from "@/lib/session";
import type { FormState } from "@/lib/types";

export async function register(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email) return { error: "Nama dan email wajib diisi." };
  if (password.length < 6) return { error: "Kata sandi minimal 6 karakter." };

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length) return { error: "Email sudah terdaftar." };

  const [result] = await db.insert(users).values({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: "user",
  });

  await createSession({ userId: result.insertId, role: "user" });
  redirect("/");
}

export async function login(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Email atau kata sandi salah." };
  }

  await createSession({ userId: user.id, role: user.role });
  redirect(user.role === "admin" ? "/admin" : "/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
