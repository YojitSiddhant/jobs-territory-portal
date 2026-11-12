"use client";

import type { JobDiscoveryQuery, WorkplaceType, EmploymentType } from "../types";

type Props = {
  query: JobDiscoveryQuery;
  onChange: (patch: Partial<JobDiscoveryQuery>) => void;
  onReset: () => void;
};

const workplaceOptions: { value: WorkplaceType; label: string }[] = [
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "REMOTE", label: "Remote" },
];

const employmentOptions: { value: EmploymentType; label: string }[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
];

export function JobFilters({ query, onChange, onReset }: Props) {
  const hasFilters =
    query.location ||
    query.workplaceType ||
    query.employmentType ||
    query.skill ||
    query.company ||
    query.salaryMin !== undefined ||
    query.salaryMax !== undefined;

  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-blue-600 hover:text-blue-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Location */}
      <div>
        <label htmlFor="filter-location" className="block text-xs font-medium text-gray-500 mb-1.5">
          Location
        </label>
        <input
          id="filter-location"
          type="text"
          placeholder="City, state, or country"
          value={query.location ?? ""}
          onChange={(e) => onChange({ location: e.target.value || undefined, page: 1 })}
          className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Workplace type */}
      <fieldset>
        <legend className="text-xs font-medium text-gray-500 mb-1.5">Workplace type</legend>
        <div className="space-y-1.5">
          {workplaceOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="workplaceType"
                value={opt.value}
                checked={query.workplaceType === opt.value}
                onChange={() =>
                  onChange({
                    workplaceType: query.workplaceType === opt.value ? undefined : opt.value,
                    page: 1,
                  })
                }
                onClick={() => {
                  if (query.workplaceType === opt.value) onChange({ workplaceType: undefined, page: 1 });
                }}
                className="accent-blue-600 w-4 h-4"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Employment type */}
      <fieldset>
        <legend className="text-xs font-medium text-gray-500 mb-1.5">Employment type</legend>
        <div className="space-y-1.5">
          {employmentOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="employmentType"
                value={opt.value}
                checked={query.employmentType === opt.value}
                onChange={() =>
                  onChange({
                    employmentType: query.employmentType === opt.value ? undefined : opt.value,
                    page: 1,
                  })
                }
                onClick={() => {
                  if (query.employmentType === opt.value) onChange({ employmentType: undefined, page: 1 });
                }}
                className="accent-blue-600 w-4 h-4"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Skills */}
      <div>
        <label htmlFor="filter-skill" className="block text-xs font-medium text-gray-500 mb-1.5">
          Skill
        </label>
        <input
          id="filter-skill"
          type="text"
          placeholder="e.g. React, Python"
          value={query.skill ?? ""}
          onChange={(e) => onChange({ skill: e.target.value || undefined, page: 1 })}
          className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Company */}
      <div>
        <label htmlFor="filter-company" className="block text-xs font-medium text-gray-500 mb-1.5">
          Company
        </label>
        <input
          id="filter-company"
          type="text"
          placeholder="Company name or ID"
          value={query.company ?? ""}
          onChange={(e) => onChange({ company: e.target.value || undefined, page: 1 })}
          className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Salary range */}
      <div>
        <span className="block text-xs font-medium text-gray-500 mb-1.5">Salary range (₹)</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            aria-label="Minimum salary"
            placeholder="Min"
            min={0}
            value={query.salaryMin ?? ""}
            onChange={(e) =>
              onChange({ salaryMin: e.target.value ? Number(e.target.value) : undefined, page: 1 })
            }
            className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            aria-label="Maximum salary"
            placeholder="Max"
            min={0}
            value={query.salaryMax ?? ""}
            onChange={(e) =>
              onChange({ salaryMax: e.target.value ? Number(e.target.value) : undefined, page: 1 })
            }
            className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
      </div>
    </aside>
  );
}
