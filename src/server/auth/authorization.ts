import type { UserRole } from "@prisma/client";
import { getSessionUser, type SessionUser } from "./session";

export class AuthorizationError extends Error {
  status = 403;
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class AuthenticationError extends Error {
  status = 401;
  constructor(message = "Authentication is required.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function requireRole(...roles: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthenticationError();
  if (!roles.includes(user.role)) throw new AuthorizationError();
  return user;
}
