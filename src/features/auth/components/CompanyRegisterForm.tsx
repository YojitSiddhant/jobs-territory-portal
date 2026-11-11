"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import { registerCompany } from "../api";

export function CompanyRegisterForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await registerCompany(email, password, companyName, contactEmail);
        router.push("/company/dashboard");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Registration failed.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField id="creg-name" label="Company name" value={companyName} onChange={setCompanyName} required disabled={isPending} autoComplete="organization" />
      <FormField id="creg-email" label="Account email" type="email" value={email} onChange={setEmail} required disabled={isPending} autoComplete="email" />
      <FormField id="creg-contact" label="Company contact email" type="email" value={contactEmail} onChange={setContactEmail} required disabled={isPending} autoComplete="off" hint="Public contact email shown to candidates." />
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
      />

      {error && (
        <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-60 transition-colors"
      >
        {isPending ? "Creating account…" : "Create company account"}
      </button>
    </form>
  );
}
