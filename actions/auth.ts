"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { createSession, deleteSession } from "@/lib/session";
import type { FormState } from "@/lib/types";

export async function register(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data registrasi tidak valid." };
  }

  const { name, email, password } = parsed.data;
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { error: "Email sudah terdaftar." };

  const [created] = await db
    .insert(users)
    .values({ name, email, password: await bcrypt.hash(password, 12), role: "user" })
    .$returningId();

  await createSession(created.id);
  redirect("/");
}

export async function login(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data login tidak valid." };
  }

  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (!user || !user.isActive || !(await bcrypt.compare(parsed.data.password, user.password))) {
    return { error: "Email atau kata sandi salah." };
  }

  await createSession(user.id);
  redirect(user.role === "admin" ? "/admin" : "/");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
