"use client";

import { useState } from "react";
import type { Experience } from "../types";

type Props = {
  value: Experience[];
  onChange: (value: Experience[]) => void;
};

const emptyEntry = (): Experience => ({
  employer: "",
  jobTitle: "",
  startDate: "",
  endDate: null,
  isCurrent: false,
  description: "",
});

const inputClass =
  "w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";

function formatDateForDisplay(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function ExperienceForm({
  entry,
  onChange,
  onSave,
  onCancel,
  error,
}: {
  entry: Experience;
  onChange: (e: Experience) => void;
  onSave: () => void;
  onCancel: () => void;
  error: string | null;
}) {
  const set = <K extends keyof Experience>(key: K, v: Experience[K]) =>
    onChange({ ...entry, [key]: v });

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">
            Employer <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={160}
            placeholder="Company name"
            value={entry.employer}
            onChange={(e) => set("employer", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">
            Job title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={160}
            placeholder="e.g. Software Engineer"
            value={entry.jobTitle}
            onChange={(e) => set("jobTitle", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">
            Start date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={toDateInputValue(entry.startDate)}
            onChange={(e) => set("startDate", e.target.value ? new Date(e.target.value).toISOString() : "")}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">End date</label>
          <input
            type="date"
            disabled={entry.isCurrent}
            value={toDateInputValue(entry.endDate)}
            onChange={(e) => set("endDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
            className={`${inputClass} disabled:opacity-40`}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={entry.isCurrent}
          onChange={(e) => {
            onChange({ ...entry, isCurrent: e.target.checked, endDate: e.target.checked ? null : entry.endDate });
          }}
          className="h-4 w-4 rounded border-gray-300 accent-blue-600"
        />
        <span className="text-xs text-gray-500">I currently work here</span>
      </label>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-500">Description</label>
        <textarea
          maxLength={5000}
          rows={2}
          placeholder="Key responsibilities and achievements…"
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
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-300 hover:bg-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ExperienceSection({ value, onChange }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Experience>(emptyEntry());
  const [formError, setFormError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  function validateEntry(e: Experience): string | null {
    if (!e.employer.trim()) return "Employer is required.";
    if (!e.jobTitle.trim()) return "Job title is required.";
    if (!e.startDate) return "Start date is required.";
    if (!e.isCurrent && !e.endDate) return "Please set an end date or mark as current.";
    if (e.endDate && new Date(e.endDate) < new Date(e.startDate))
      return "End date cannot be before start date.";
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
        <h2 className="text-base font-semibold text-gray-900">Work experience</h2>
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
          No experience entries yet. Add your work history or internships.
        </p>
      )}

      <div className="space-y-3">
        {value.map((exp, i) =>
          editingIndex === i ? (
            <ExperienceForm
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
                <p className="text-sm font-medium text-gray-900">{exp.jobTitle}</p>
                <p className="text-sm text-gray-500">{exp.employer}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDateForDisplay(exp.startDate)} –{" "}
                  {exp.isCurrent ? "Present" : formatDateForDisplay(exp.endDate)}
                </p>
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
        <ExperienceForm
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
