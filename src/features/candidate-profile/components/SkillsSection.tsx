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
    <section className="rounded-2xl bg-white border border-gray-200 p-6 space-y-4 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">Skills</h2>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          maxLength={80}
          placeholder="e.g. JavaScript, Python, Figma…"
          value={input}
          onChange={(e) => { setInput(e.target.value); setInputError(null); }}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        <button
          type="button"
          onClick={addSkill}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shrink-0"
        >
          Add
        </button>
      </div>

      {inputError && <p className="text-xs text-red-600">{inputError}</p>}

      {value.length === 0 ? (
        <p className="text-sm text-gray-400">No skills added yet. Type a skill and press Enter or Add.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {value.map((skill, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(i)}
                aria-label={`Remove ${skill}`}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400">{value.length}/50 skills</p>
    </section>
  );
}
