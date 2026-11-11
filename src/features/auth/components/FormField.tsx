type Props = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
};

export function FormField({ id, label, type = "text", value, onChange, required, disabled, placeholder, autoComplete, hint }: Props) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-zinc-400 mb-1.5">
        {label}{required && <span className="text-zinc-600 ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      />
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
