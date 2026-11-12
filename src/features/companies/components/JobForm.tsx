"use client";

import { useState, useTransition } from "react";
import type { CompanyJob, JobFormInput } from "../types";
import { createJob, updateJob } from "../api";

type Props = {
  job?: CompanyJob;
  onSaved: (job: CompanyJob) => void;
  onCancel?: () => void;
};

export type JobFormState = JobFormInput & { deadlineStr: string; skillsStr: string };

export function jobToForm(j: CompanyJob): JobFormState {
  return {
    title: j.title, description: j.description, location: j.location ?? "",
    workplaceType: (j.workplaceType as JobFormInput["workplaceType"]) ?? "ONSITE",
    employmentType: (j.employmentType as JobFormInput["employmentType"]) ?? "FULL_TIME",
    experienceRequirement: j.experienceRequirement ?? "",
    requiredSkills: j.requiredSkills,
    skillsStr: j.requiredSkills.join(", "),
    salaryMin: j.salaryMin ?? undefined, salaryMax: j.salaryMax ?? undefined,
    applicationDeadline: j.applicationDeadline ?? undefined,
    deadlineStr: j.applicationDeadline ? j.applicationDeadline.slice(0, 10) : "",
  };
}

export function emptyJobForm(): JobFormState {
  return { title: "", description: "", location: "", workplaceType: "ONSITE" as const, employmentType: "FULL_TIME" as const, experienceRequirement: "", requiredSkills: [] as string[], skillsStr: "", salaryMin: undefined as number | undefined, salaryMax: undefined as number | undefined, applicationDeadline: undefined as string | undefined, deadlineStr: "" };
}

export function JobForm({ job, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<JobFormState>(() => job ? jobToForm(job) : emptyJobForm());
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setFieldErrors({});

    const skills = form.skillsStr.split(",").map((s) => s.trim()).filter(Boolean);
    const nextFieldErrors: Record<string, string> = {};
    if (!form.title.trim()) nextFieldErrors.title = "Job title is required.";
    if (!form.description.trim()) nextFieldErrors.description = "Description is required.";
    if (!form.experienceRequirement.trim()) nextFieldErrors.experienceRequirement = "Experience requirement is required.";
    if (skills.length === 0) nextFieldErrors.skillsStr = "At least one skill is required.";
    if (form.salaryMin !== undefined && form.salaryMax !== undefined && form.salaryMax !== null && form.salaryMin !== null && form.salaryMax < form.salaryMin) nextFieldErrors.salaryMax = "Salary maximum cannot be below salary minimum.";
    if (Object.keys(nextFieldErrors).length > 0) { setFieldErrors(nextFieldErrors); setError("Please correct the highlighted fields."); return; }

    const input: JobFormInput = {
      title: form.title, description: form.description,
      location: form.location || null,
      workplaceType: form.workplaceType, employmentType: form.employmentType,
      experienceRequirement: form.experienceRequirement,
      requiredSkills: skills,
      salaryMin: form.salaryMin ?? null, salaryMax: form.salaryMax ?? null,
      applicationDeadline: form.deadlineStr ? new Date(form.deadlineStr).toISOString() : null,
    };

    startTransition(async () => {
      try {
        const saved = job ? await updateJob(job.id, input) : await createJob(input);
        onSaved(saved);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save job.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="job-title" className={labelCls}>Job title <span className="text-gray-400">*</span></label>
        <input id="job-title" type="text" value={form.title} onChange={(e) => set("title", e.target.value)} required maxLength={180} className={inputCls} />
        {fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
      </div>

      <div>
        <label htmlFor="job-desc" className={labelCls}>Description <span className="text-gray-400">*</span></label>
        <textarea id="job-desc" rows={6} value={form.description} onChange={(e) => set("description", e.target.value)} required maxLength={20000} className={`${inputCls} resize-y`} />
        {fieldErrors.description && <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="job-location" className={labelCls}>Location</label>
          <input id="job-location" type="text" value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} maxLength={180} placeholder="City or remote" className={inputCls} />
        </div>
        <div>
          <label htmlFor="job-experience" className={labelCls}>Experience requirement <span className="text-gray-400">*</span></label>
          <input id="job-experience" type="text" value={form.experienceRequirement} onChange={(e) => set("experienceRequirement", e.target.value)} required maxLength={160} placeholder="e.g. 0–1 years" className={inputCls} />
          {fieldErrors.experienceRequirement && <p className="mt-1 text-xs text-red-600">{fieldErrors.experienceRequirement}</p>}
        </div>
        <div>
          <label htmlFor="job-workplace" className={labelCls}>Workplace type <span className="text-gray-400">*</span></label>
          <select id="job-workplace" value={form.workplaceType} onChange={(e) => set("workplaceType", e.target.value as JobFormInput["workplaceType"])} className={selectCls}>
            <option value="ONSITE">On-site</option>
            <option value="HYBRID">Hybrid</option>
            <option value="REMOTE">Remote</option>
          </select>
        </div>
        <div>
          <label htmlFor="job-employment" className={labelCls}>Employment type <span className="text-gray-400">*</span></label>
          <select id="job-employment" value={form.employmentType} onChange={(e) => set("employmentType", e.target.value as JobFormInput["employmentType"])} className={selectCls}>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </div>
        <div>
          <label htmlFor="job-salary-min" className={labelCls}>Salary min (₹)</label>
          <input id="job-salary-min" type="number" min={0} value={form.salaryMin ?? ""} onChange={(e) => set("salaryMin", e.target.value ? Number(e.target.value) : undefined)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="job-salary-max" className={labelCls}>Salary max (₹)</label>
          <input id="job-salary-max" type="number" min={0} value={form.salaryMax ?? ""} onChange={(e) => set("salaryMax", e.target.value ? Number(e.target.value) : undefined)} className={inputCls} />
          {fieldErrors.salaryMax && <p className="mt-1 text-xs text-red-600">{fieldErrors.salaryMax}</p>}
        </div>
        <div>
          <label htmlFor="job-deadline" className={labelCls}>Application deadline</label>
          <input id="job-deadline" type="date" value={form.deadlineStr} onChange={(e) => set("deadlineStr", e.target.value)} className={inputCls} />
        </div>
      </div>

      <div>
        <label htmlFor="job-skills" className={labelCls}>Required skills <span className="text-gray-400">*</span> <span className="text-gray-400 font-normal">(comma-separated)</span></label>
        <input id="job-skills" type="text" value={form.skillsStr} onChange={(e) => set("skillsStr", e.target.value)} required placeholder="React, TypeScript, Node.js" className={inputCls} />
        {fieldErrors.skillsStr && <p className="mt-1 text-xs text-red-600">{fieldErrors.skillsStr}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={isPending} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors">
          {isPending ? "Saving…" : job ? "Save changes" : "Create draft"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
        )}
      </div>
    </form>
  );
}

const labelCls = "block text-xs font-medium text-gray-500 mb-1.5";
const inputCls = "w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors";
const selectCls = "w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors";
