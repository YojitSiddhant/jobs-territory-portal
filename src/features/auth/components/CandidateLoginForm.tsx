"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import { loginCandidate } from "../api";

export function CandidateLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await loginCandidate(email, password);
        router.push("/candidate/applications");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField id="login-email" label="Email" type="email" value={email} onChange={setEmail} required disabled={isPending} autoComplete="email" />
      <FormField id="login-password" label="Password" type="password" value={password} onChange={setPassword} required disabled={isPending} autoComplete="current-password" />

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
