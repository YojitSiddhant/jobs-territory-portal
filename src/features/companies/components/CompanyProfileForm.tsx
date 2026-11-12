"use client";

import { useState, useTransition } from "react";
import type { CompanyProfile } from "../types";
import { createCompanyProfile, updateCompanyProfile } from "../api";

type FormState = {
  name: string; registrationNumber: string; website: string; officialEmail: string;
  phone: string; address: string; industry: string; description: string;
};

function profileToForm(p: CompanyProfile): FormState {
  return { name: p.name, registrationNumber: p.registrationNumber, website: p.website, officialEmail: p.officialEmail, phone: p.phone, address: p.address, industry: p.industry, description: p.description };
}

function emptyForm(): FormState {
  return { name: "", registrationNumber: "", website: "", officialEmail: "", phone: "", address: "", industry: "", description: "" };
}

type Props = {
  profile: CompanyProfile | null;
  onSaved: (profile: CompanyProfile) => void;
  readonly?: boolean;
};

export function CompanyProfileForm({ profile, onSaved, readonly = false }: Props) {
  const [form, setForm] = useState<FormState>(profile ? profileToForm(profile) : emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSuccess(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const saved = profile
          ? await updateCompanyProfile(form)
          : await createCompanyProfile(form);
        onSaved(saved);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Company name" id="cp-name" required>
          <input id="cp-name" type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)} disabled={readonly || isPending} required maxLength={160} className={inputCls(readonly)} />
        </Field>
        <Field label="Registration number" id="cp-reg" required>
          <input id="cp-reg" type="text" value={form.registrationNumber} onChange={(e) => handleChange("registrationNumber", e.target.value)} disabled={readonly || isPending} required maxLength={100} className={inputCls(readonly)} />
        </Field>
        <Field label="Website" id="cp-web" required>
          <input id="cp-web" type="url" value={form.website} onChange={(e) => handleChange("website", e.target.value)} disabled={readonly || isPending} required maxLength={500} placeholder="https://" className={inputCls(readonly)} />
        </Field>
        <Field label="Official email" id="cp-email" required>
          <input id="cp-email" type="email" value={form.officialEmail} onChange={(e) => handleChange("officialEmail", e.target.value)} disabled={readonly || isPending} required className={inputCls(readonly)} />
        </Field>
        <Field label="Phone" id="cp-phone" required>
          <input id="cp-phone" type="text" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} disabled={readonly || isPending} required maxLength={40} className={inputCls(readonly)} />
        </Field>
        <Field label="Industry" id="cp-industry" required>
          <input id="cp-industry" type="text" value={form.industry} onChange={(e) => handleChange("industry", e.target.value)} disabled={readonly || isPending} required maxLength={120} className={inputCls(readonly)} />
        </Field>
      </div>

      <Field label="Address" id="cp-address" required>
        <input id="cp-address" type="text" value={form.address} onChange={(e) => handleChange("address", e.target.value)} disabled={readonly || isPending} required maxLength={1000} className={inputCls(readonly)} />
      </Field>

      <Field label="Description" id="cp-desc" required>
        <textarea id="cp-desc" rows={4} value={form.description} onChange={(e) => handleChange("description", e.target.value)} disabled={readonly || isPending} required maxLength={5000} className={`${inputCls(readonly)} resize-y`} />
      </Field>

      {!readonly && (
        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors">
            {isPending ? <Spinner /> : null}
            {isPending ? "Saving…" : "Save company details"}
          </button>
          {success && <span className="text-sm text-emerald-600">Company details saved successfully.</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      )}
    </form>
  );
}

function inputCls(disabled: boolean) {
  return `w-full rounded-xl bg-white border ${disabled ? "border-gray-200 text-gray-400 cursor-not-allowed" : "border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"} px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none transition-colors`;
}

function Field({ label, id, required, children }: { label: string; id: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-500 mb-1.5">
        {label}{required && <span className="text-gray-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M12 7A5 5 0 1 1 7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
