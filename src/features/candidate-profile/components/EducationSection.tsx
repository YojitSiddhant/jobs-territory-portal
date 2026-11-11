"use client";

import { useState } from "react";
import type { Education } from "../types";

type Props = {
  value: Education[];
  onChange: (value: Education[]) => void;
};

const CURRENT_YEAR = new Date().getFullYear();

const emptyEntry = (): Education => ({
  institution: "",
  qualification: "",
  fieldOfStudy: "",
  startYear: null,
  endYear: null,
  description: "",
});

const inputClass =
  "w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors";

function EducationForm({
  entry,
  onChange,
  onSave,
  onCancel,
  error,
}: {
  entry: Education;
  onChange: (e: Education) => void;
  onSave: () => void;
  onCancel: () => void;
  error: string | null;
}) {
  const set = (key: keyof Education, v: string | number | null) =>
    onChange({ ...entry, [key]: v });

  const yearVal = (s: string) => (s === "" ? null : Number(s));

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/40 p-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-400">
            Institution <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            maxLength={160}
            placeholder="University or school name"
            value={entry.institution}
            onChange={(e) => set("institution", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-400">
            Qualification <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            maxLength={160}
            placeholder="e.g. Bachelor of Science"
            value={entry.qualification}
            onChange={(e) => set("qualification", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-zinc-400">Field of study</label>
        <input
          type="text"
          maxLength={160}
          placeholder="e.g. Computer Science"
          value={entry.fieldOfStudy ?? ""}
          onChange={(e) => set("fieldOfStudy", e.target.value || null)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-400">Start year</label>
          <input
            type="number"
            min={1900}
            max={CURRENT_YEAR + 10}
            placeholder="2020"
            value={entry.startYear ?? ""}
            onChange={(e) => set("startYear", yearVal(e.target.value))}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-400">End year</label>
          <input
            type="number"
            min={1900}
            max={CURRENT_YEAR + 10}
            placeholder="2024"
            value={entry.endYear ?? ""}
            onChange={(e) => set("endYear", yearVal(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-zinc-400">Description</label>
        <textarea
          maxLength={5000}
          rows={2}
          placeholder="Relevant coursework, achievements, or activities…"
          value={entry.description ?? ""}
          onChange={(e) => set("description", e.target.value || null)}
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function EducationSection({ value, onChange }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Education>(emptyEntry());
  const [formError, setFormError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  function validateEntry(e: Education): string | null {
    if (!e.institution.trim()) return "Institution is required.";
    if (!e.qualification.trim()) return "Qualification is required.";
    if (e.startYear && e.endYear && e.endYear < e.startYear)
      return "End year cannot be before start year.";
    return null;
  }

  function startAdd() {
    setDraft(emptyEntry());
    setIsAdding(true);
    setEditingIndex(null);
    setFormError(null);
  }

  function startEdit(index: number) {
    setDraft({ ...value[index] });
    setEditingIndex(index);
    setIsAdding(false);
    setFormError(null);
  }

  function saveAdd() {
    const err = validateEntry(draft);
    if (err) { setFormError(err); return; }
    onChange([...value, draft]);
    setIsAdding(false);
    setDraft(emptyEntry());
  }

  function saveEdit() {
    if (editingIndex === null) return;
    const err = validateEntry(draft);
    if (err) { setFormError(err); return; }
    const next = [...value];
    next[editingIndex] = draft;
    onChange(next);
    setEditingIndex(null);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  }

  return (
    <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-100">Education</h2>
        {!isAdding && (
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add
          </button>
        )}
      </div>

      {value.length === 0 && !isAdding && (
        <p className="text-sm text-zinc-500 py-2">
          No education entries yet. Add your degrees or certifications.
        </p>
      )}

      <div className="space-y-3">
        {value.map((edu, i) =>
          editingIndex === i ? (
            <EducationForm
              key={i}
              entry={draft}
              onChange={setDraft}
              onSave={saveEdit}
              onCancel={() => setEditingIndex(null)}
              error={formError}
            />
          ) : (
            <div
              key={i}
              className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-100">{edu.qualification}</p>
                <p className="text-sm text-zinc-400">{edu.institution}</p>
                {edu.fieldOfStudy && (
                  <p className="text-xs text-zinc-500 mt-0.5">{edu.fieldOfStudy}</p>
                )}
                {(edu.startYear || edu.endYear) && (
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {edu.startYear ?? "?"} – {edu.endYear ?? "Present"}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(i)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {isAdding && (
        <EducationForm
          entry={draft}
          onChange={setDraft}
          onSave={saveAdd}
          onCancel={() => setIsAdding(false)}
          error={formError}
        />
      )}
    </section>
  );
}
