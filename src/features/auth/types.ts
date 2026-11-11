import type { SafeUser } from "@/server/auth/safe-user";

export type { SafeUser };

export type AuthError = { code: string; message: string };
export type AuthResult = { user: SafeUser } | { error: AuthError };
