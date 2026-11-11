"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import { ApiRequestError, registerCompany } from "../api";

export function CompanyRegisterForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const next: Record<string, string> = {};
    if (!companyName.trim()) next.companyName = "Company name is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid account email.";
    if (!/^\S+@\S+\.\S+$/.test(contactEmail)) next.contactEmail = "Enter a valid company contact email.";
    if (password.length < 12) next.password = "Password must be at least 12 characters.";
    setFieldErrors(next); if (Object.keys(next).length) return;
    startTransition(async () => {
      try {
        await registerCompany(email, password, companyName, contactEmail); setSuccess(true);
        setTimeout(() => { router.push("/company/dashboard"); router.refresh(); }, 1200);
      } catch (err) {
        if (err instanceof ApiRequestError && err.issues?.length) { const issues: Record<string, string> = {}; for (const issue of err.issues) { const key = String(issue.path?.[0] ?? ""); if (key === "companyName" || key === "email" || key === "contactEmail" || key === "password") issues[key] = issue.message ?? "Invalid value."; } setFieldErrors(issues); if (!Object.keys(issues).length) setError(err.message); }
        else setError(err instanceof Error ? err.message : "Registration failed.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField id="creg-name" label="Company name" value={companyName} onChange={setCompanyName} required disabled={isPending} autoComplete="organization" error={fieldErrors.companyName} />
      <FormField id="creg-email" label="Account email" type="email" value={email} onChange={setEmail} required disabled={isPending} autoComplete="email" error={fieldErrors.email} />
      <FormField id="creg-contact" label="Company contact email" type="email" value={contactEmail} onChange={setContactEmail} required disabled={isPending} autoComplete="off" hint="Public contact email shown to candidates." error={fieldErrors.contactEmail} />
      <FormField
        id="creg-password"
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
        {isPending ? "Creating account…" : "Create company account"}
      </button>
    </form>
  );
}
