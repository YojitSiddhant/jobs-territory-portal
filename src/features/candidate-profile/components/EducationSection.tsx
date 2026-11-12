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
  "w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";

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
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">
            Institution <span className="text-red-500">*</span>
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
          <label className="block text-xs font-medium text-gray-500">
            Qualification <span className="text-red-500">*</span>
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
        <label className="block text-xs font-medium text-gray-500">Field of study</label>
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
          <label className="block text-xs font-medium text-gray-500">Start year</label>
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
          <label className="block text-xs font-medium text-gray-500">End year</label>
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
        <label className="block text-xs font-medium text-gray-500">Description</label>
        <textarea
          maxLength={5000}
          rows={2}
          placeholder="Relevant coursework, achievements, or activities…"
          value={entry.description ?? ""}
          onChange={(e) => set("description", e.target.value || null)}
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
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
    <section className="rounded-2xl bg-white border border-gray-200 p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Education</h2>
        {!isAdding && (
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add
          </button>
        )}
      </div>

      {value.length === 0 && !isAdding && (
        <p className="text-sm text-gray-400 py-2">
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
              className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{edu.qualification}</p>
                <p className="text-sm text-gray-500">{edu.institution}</p>
                {edu.fieldOfStudy && (
                  <p className="text-xs text-gray-400 mt-0.5">{edu.fieldOfStudy}</p>
                )}
                {(edu.startYear || edu.endYear) && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {edu.startYear ?? "?"} – {edu.endYear ?? "Present"}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(i)}
                  className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-xs text-red-500 hover:text-red-600 transition-colors"
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
