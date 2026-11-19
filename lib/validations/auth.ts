import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(255),
  email: z.string().email("Format email tidak valid"),
  nik: z.string().regex(/^\d{16}$/, "NIK harus terdiri dari 16 digit angka"),
  address: z.string().trim().min(1, "Alamat wajib diisi"),
  password: z.string().min(10, "Password minimal 10 karakter").max(128),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
