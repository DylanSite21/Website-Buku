import { SignJWT } from "jose";
import { cookies } from "next/headers";
import {
  getSessionSecret,
  getSessionUserId,
  SESSION_COOKIE_NAME,
} from "@/lib/session-token";

const SESSION_DURATION = 86400;

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function readSession() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return token ? getSessionUserId(token) : null;
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}
