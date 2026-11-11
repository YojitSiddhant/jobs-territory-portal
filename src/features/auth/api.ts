import type { SafeUser } from "./types";

export class ApiRequestError extends Error {
  issues?: { path?: (string | number)[]; message?: string }[];
  constructor(message: string, issues?: { path?: (string | number)[]; message?: string }[]) { super(message); this.name = "ApiRequestError"; this.issues = issues; }
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new ApiRequestError(data?.error?.message ?? "Request failed.", data?.error?.issues);
  return data.data as T;
}

export async function loginCandidate(email: string, password: string): Promise<SafeUser> {
  const result = await post<{ user: SafeUser }>("/api/auth/login", { email, password });
  return result.user;
}

export async function loginAdmin(email: string, password: string): Promise<SafeUser> {
  const result = await post<{ user: SafeUser }>("/api/auth/admin/login", { email, password });
  return result.user;
}

export async function registerCandidate(email: string, password: string, fullName: string): Promise<SafeUser> {
  const result = await post<{ user: SafeUser }>("/api/auth/register/candidate", { email, password, fullName });
  return result.user;
}

export async function registerCompany(email: string, password: string, companyName: string, contactEmail: string): Promise<SafeUser> {
  const result = await post<{ user: SafeUser }>("/api/auth/register/company", { email, password, companyName, contactEmail });
  return result.user;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
