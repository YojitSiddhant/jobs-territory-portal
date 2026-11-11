"use client";

import { useState, useRef } from "react";

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
};

export function SkillsSection({ value, onChange }: Props) {
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addSkill() {
    const skill = input.trim();
    if (!skill) return;
    if (skill.length > 80) { setInputError("Skill must be 80 characters or fewer."); return; }
    if (value.length >= 50) { setInputError("Maximum 50 skills allowed."); return; }
    if (value.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setInputError("This skill is already added.");
      return;
    }
    onChange([...value, skill]);
    setInput("");
    setInputError(null);
    inputRef.current?.focus();
  }

  function removeSkill(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }

  return (
    <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
      <h2 className="text-base font-semibold text-zinc-100">Skills</h2>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          maxLength={80}
          placeholder="e.g. JavaScript, Python, Figma…"
          value={input}
          onChange={(e) => { setInput(e.target.value); setInputError(null); }}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
        />
        <button
          type="button"
          onClick={addSkill}
          className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors shrink-0"
        >
          Add
        </button>
      </div>

      {inputError && <p className="text-xs text-red-400">{inputError}</p>}

      {value.length === 0 ? (
        <p className="text-sm text-zinc-500">No skills added yet. Type a skill and press Enter or Add.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {value.map((skill, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-200"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(i)}
                aria-label={`Remove ${skill}`}
                className="text-zinc-500 hover:text-red-400 transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-zinc-500">{value.length}/50 skills</p>
    </section>
  );
}
