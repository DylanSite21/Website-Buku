import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const COVER_DIR = path.join(process.cwd(), "uploads", "covers");
export const COVER_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

// cek isi file (magic bytes), bukan hanya ekstensi atau MIME dari browser
function detectExt(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (
    buf
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "png";
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "webp";
  return null;
}

export async function saveCover(
  file: File,
): Promise<{ filename: string } | { error: string }> {
  if (file.size > MAX_SIZE) return { error: "Ukuran gambar maksimal 2 MB." };

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectExt(buf);
  if (!ext) return { error: "Format gambar harus JPG, PNG, atau WebP." };

  await mkdir(COVER_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(COVER_DIR, filename), buf);
  return { filename };
}

export async function deleteCover(filename: string | null) {
  if (!filename || !COVER_NAME.test(filename)) return;
  await unlink(path.join(COVER_DIR, filename)).catch(() => {});
}
