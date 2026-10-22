import { readFile } from "node:fs/promises";
import path from "node:path";
import { COVER_DIR, COVER_NAME } from "@/lib/uploads";

const TYPES = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

export async function GET(
  _: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!COVER_NAME.test(filename))
    return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(path.join(COVER_DIR, filename));
    const ext = filename.split(".").pop() as keyof typeof TYPES;
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
