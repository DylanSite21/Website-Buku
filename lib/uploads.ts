import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", { extension: "jpg", signature: [0xff, 0xd8, 0xff] }],
  ["image/png", { extension: "png", signature: [0x89, 0x50, 0x4e, 0x47] }],
  ["image/webp", { extension: "webp", signature: [0x52, 0x49, 0x46, 0x46] }],
]);

export async function saveImage(file: File, directory: "covers" | "payment-proofs") {
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return { error: "Ukuran file harus lebih kecil dari 5 MB." } as const;
  }

  const metadata = allowedTypes.get(file.type);
  if (!metadata) return { error: "Format file harus JPG, PNG, atau WebP." } as const;

  const bytes = Buffer.from(await file.arrayBuffer());
  if (
    !metadata.signature.every((byte, index) => bytes[index] === byte) ||
    (file.type === "image/webp" && bytes.subarray(8, 12).toString() !== "WEBP")
  ) {
    return { error: "Isi file tidak sesuai dengan format gambar." } as const;
  }

  const filename = `${randomUUID()}.${metadata.extension}`;
  const filePath = directory === "covers"
    ? path.join(process.cwd(), "public", "uploads", filename)
    : path.join(process.cwd(), "uploads", "payment-proofs", filename);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, bytes, { flag: "wx" });
  return { filename } as const;
}

export async function deleteCover(filename: string | null) {
  if (!filename || !/^[0-9a-f-]+\.(jpg|png|webp)$/i.test(filename)) return;
  await unlink(path.join(process.cwd(), "public", "uploads", filename)).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    },
  );
}

export async function deletePaymentProof(filename: string | null) {
  if (!filename || !/^[0-9a-f-]+\.(jpg|png|webp)$/i.test(filename)) return;
  await unlink(path.join(process.cwd(), "uploads", "payment-proofs", filename)).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    },
  );
}
