import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { users } from "@/db/schema";
import { db } from "@/lib/db";
import { sessionPredatesPasswordChange } from "@/lib/jwt";
import { getSession } from "@/lib/session";

// Data Access Layer: the one place that turns a session cookie into a user.
// The proxy only does an optimistic redirect; this is the real check.

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  currency: string;
};

type SessionCheck =
  | { user: CurrentUser }
  // "stale": a valid cookie, but the account is gone or its password changed since
  | { user: null; reason: "signed-out" | "stale" };

/** Checks the cookie against the database. Runs once per request. */
const checkSession = cache(async (): Promise<SessionCheck> => {
  const session = await getSession();
  if (!session) return { user: null, reason: "signed-out" };

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: { id: true, name: true, email: true, currency: true, passwordChangedAt: true },
  });
  if (!user || sessionPredatesPasswordChange(session.issuedAt, user.passwordChangedAt)) {
    return { user: null, reason: "stale" };
  }

  return { user: { id: user.id, name: user.name, email: user.email, currency: user.currency } };
});

function redirectAway(reason: "signed-out" | "stale"): never {
  // Rendering can't delete cookies, so stale sessions go through the logout handler
  redirect(reason === "stale" ? "/logout" : "/login");
}

/** For Server Components. Redirects to /login when signed out. */
export async function getCurrentUser(): Promise<CurrentUser> {
  const check = await checkSession();
  if (!check.user) redirectAway(check.reason);
  return check.user;
}

/** For Server Actions, which must re-check auth on every call. */
export async function requireUserId(): Promise<string> {
  const check = await checkSession();
  if (!check.user) redirectAway(check.reason);
  return check.user.id;
}

/** For Route Handlers, which answer 401 instead of redirecting. */
export async function getUserIdOrNull(): Promise<string | null> {
  return (await checkSession()).user?.id ?? null;
}
