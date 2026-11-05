import { z } from "zod";

export const bookSchema = z.object({
  title: z.string().trim().min(1, "Judul buku wajib diisi").max(255),
  categoryId: z.string().uuid("Kategori tidak valid"),
  author: z.string().trim().min(1, "Penulis wajib diisi").max(255),
  publisher: z.string().trim().min(1, "Penerbit wajib diisi").max(255),
  publicationYear: z.number().int().min(1000).max(new Date().getFullYear()),
  isbn: z.string().trim().max(20).refine((value) => !value || value.length >= 10, "ISBN minimal 10 karakter"),
  price: z.string().regex(/^\d{1,10}(\.\d{1,2})?$/, "Harga maksimal 10 digit dan 2 angka desimal"),
  totalStock: z.number().int().min(0, "Stok tidak boleh negatif").max(100000),
  description: z.string().max(10000).optional(),
  image: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export type BookInput = z.infer<typeof bookSchema>;
