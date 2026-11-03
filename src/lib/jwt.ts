import { jwtVerify, SignJWT } from "jose";

// Kept free of `next/headers` so both the proxy and server code can import it.

export const SESSION_COOKIE = "session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SessionClaims = {
  userId: string;
  /** When the session was created, in whole seconds since 1970 (the JWT `iat`) */
  issuedAt: number;
};

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signSession(userId: string, expiresAt: Date): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getKey());
}

/** The session's claims if the token is valid and unexpired, otherwise null. */
export async function readSession(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || typeof payload.iat !== "number") return null;
    return { userId: payload.userId, issuedAt: payload.iat };
  } catch {
    return null;
  }
}

/** Returns the user id if the token is valid and unexpired, otherwise null. */
export async function verifySession(token: string | undefined): Promise<string | null> {
  return (await readSession(token))?.userId ?? null;
}

/**
 * True when a session was created before the user's last password change, so it
 * must no longer work ("log out everywhere"). `iat` only has whole seconds, so the
 * comparison is in seconds: a session made right after the change stays valid.
 */
export function sessionPredatesPasswordChange(
  issuedAt: number,
  passwordChangedAt: Date | null,
): boolean {
  return passwordChangedAt !== null && Math.floor(passwordChangedAt.getTime() / 1000) > issuedAt;
}
