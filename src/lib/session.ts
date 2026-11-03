import "server-only";
import { cookies } from "next/headers";
import {
  readSession,
  SESSION_COOKIE,
  SESSION_DURATION_MS,
  type SessionClaims,
  signSession,
} from "@/lib/jwt";

export async function createSession(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = await signSession(userId, expiresAt);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, // not readable from JavaScript, so XSS can't steal it
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed session from the cookie. Use the DAL (src/lib/auth.ts) for real checks. */
export async function getSession(): Promise<SessionClaims | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return readSession(token);
}
