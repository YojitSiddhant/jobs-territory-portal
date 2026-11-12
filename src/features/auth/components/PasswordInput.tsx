"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  id: string; value: string; onChange: (value: string) => void; required?: boolean; disabled?: boolean; autoComplete?: string; error?: string;
};

export function PasswordInput({ id, value, onChange, required, disabled, autoComplete, error }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={visible ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} required={required} disabled={disabled} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`w-full rounded-xl bg-white border px-3 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${error ? "border-red-400" : "border-gray-200"}`} />
      <button type="button" onClick={() => setVisible((current) => !current)} disabled={disabled} aria-label={visible ? "Hide password" : "Show password"} title={visible ? "Hide password" : "Show password"} className="absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50">
        {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
      </button>
    </div>
  );
}
