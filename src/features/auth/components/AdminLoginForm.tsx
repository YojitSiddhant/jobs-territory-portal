"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import { ApiRequestError, loginAdmin } from "../api";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setFieldErrors(next); if (Object.keys(next).length) return;
    startTransition(async () => {
      try {
        await loginAdmin(email, password); setSuccess(true);
        setTimeout(() => { router.push("/admin/dashboard"); router.refresh(); }, 700);
      } catch (err) {
        if (err instanceof ApiRequestError && err.issues?.length) { const issues: Record<string, string> = {}; for (const issue of err.issues) { const key = String(issue.path?.[0] ?? ""); if (key === "email" || key === "password") issues[key] = issue.message ?? "Invalid value."; } setFieldErrors(issues); if (!Object.keys(issues).length) setError(err.message); }
        else setError(err instanceof Error ? err.message : "Login failed.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField id="admin-email" label="Email" type="email" value={email} onChange={setEmail} required disabled={isPending} autoComplete="email" error={fieldErrors.email} />
      <FormField id="admin-password" label="Password" type="password" value={password} onChange={setPassword} required disabled={isPending} autoComplete="current-password" error={fieldErrors.password} />

      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Signed in successfully. Redirecting…</div>}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
