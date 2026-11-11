import type { UserRole } from "@prisma/client";

export type SafeUser = { id: string; email: string; role: UserRole };

export function safeUser(user: SafeUser): SafeUser {
  return { id: user.id, email: user.email, role: user.role };
}
