"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import { ApiRequestError, registerCandidate } from "../api";

export function CandidateRegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
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
    if (!fullName.trim()) next.fullName = "Full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 12) next.password = "Password must be at least 12 characters.";
    setFieldErrors(next); if (Object.keys(next).length) return;
    startTransition(async () => {
      try {
        await registerCandidate(email, password, fullName); setSuccess(true);
        setTimeout(() => { router.push("/candidate/applications"); router.refresh(); }, 1200);
      } catch (err) {
        if (err instanceof ApiRequestError && err.issues?.length) { const issues: Record<string, string> = {}; for (const issue of err.issues) { const key = String(issue.path?.[0] ?? ""); if (key === "fullName" || key === "email" || key === "password") issues[key] = issue.message ?? "Invalid value."; } setFieldErrors(issues); if (!Object.keys(issues).length) setError(err.message); }
        else setError(err instanceof Error ? err.message : "Registration failed.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField id="reg-name" label="Full name" value={fullName} onChange={setFullName} required disabled={isPending} autoComplete="name" error={fieldErrors.fullName} />
      <FormField id="reg-email" label="Email" type="email" value={email} onChange={setEmail} required disabled={isPending} autoComplete="email" error={fieldErrors.email} />
      <FormField
        id="reg-password"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        disabled={isPending}
        autoComplete="new-password"
        hint="Minimum 12 characters."
        error={fieldErrors.password}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Account created successfully. You can now log in.</div>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors"
      >
        {isPending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
