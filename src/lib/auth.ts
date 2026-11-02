import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { users } from "@/db/schema";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

// Data Access Layer: the one place that turns a session cookie into a user.
// The proxy only does an optimistic redirect; this is the real check.

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  currency: string;
};

/** For Server Components. Redirects to /login when signed out. Runs once per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, name: true, email: true, currency: true },
  });

  // Valid cookie but the account no longer exists: clear the cookie.
  if (!user) redirect("/logout");

  return user;
});

/** For Server Actions and Route Handlers, which must re-check auth on every call. */
export async function requireUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  return userId;
}
