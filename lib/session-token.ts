import { jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "book-store-session";

export function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET harus diatur dan memiliki minimal 32 karakter.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function getSessionUserId(token: string) {
  const secret = getSessionSecret();

  try {
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
}
