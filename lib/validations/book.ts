import { z } from "zod";

export const bookSchema = z.object({
  title: z.string().min(1, "Judul buku wajib diisi"),
  categoryId: z.string().uuid("Kategori tidak valid"),
  author: z.string().min(1, "Penulis wajib diisi"),
  publisher: z.string().min(1, "Penerbit wajib diisi"),
  publicationYear: z.number().int().min(1000).max(new Date().getFullYear()),
  isbn: z.string().min(10, "ISBN minimal 10 karakter"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Format harga tidak valid"),
  totalStock: z.number().int().min(0, "Stok tidak boleh negatif"),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export type BookInput = z.infer<typeof bookSchema>;
