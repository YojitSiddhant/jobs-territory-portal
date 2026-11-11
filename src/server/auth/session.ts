import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";

export const SESSION_COOKIE = "jobs_territory_session";

export type SessionUser = { id: string; role: UserRole };

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value) return null;

  // Do not trust client-provided role data. Replace this placeholder with a
  // signed/encrypted session lookup before enabling protected features.
  return null;
}
