"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import { registerCandidate } from "../api";

export function CandidateRegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await registerCandidate(email, password, fullName);
        router.push("/candidate/applications");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Registration failed.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField id="reg-name" label="Full name" value={fullName} onChange={setFullName} required disabled={isPending} autoComplete="name" />
      <FormField id="reg-email" label="Email" type="email" value={email} onChange={setEmail} required disabled={isPending} autoComplete="email" />
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
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

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
