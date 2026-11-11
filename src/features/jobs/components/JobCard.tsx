import Link from "next/link";
import type { PublicJob } from "../types";

const workplaceLabels: Record<string, string> = {
  ONSITE: "On-site",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
};

const employmentLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
};

function formatSalary(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}k`;
  if (min !== null && max !== null) return `${fmt(min)} – ${fmt(max)}`;
  if (min !== null) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function formatDeadline(deadline: string | null, now: Date): string | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Closing today";
  if (diffDays === 1) return "Closes tomorrow";
  if (diffDays <= 7) return `Closes in ${diffDays} days`;
  return `Deadline ${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
}

type Props = { job: PublicJob };

export function JobCard({ job, now }: Props & { now: Date }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const deadline = formatDeadline(job.applicationDeadline, now);
  const isUrgent =
    job.applicationDeadline !== null &&
    new Date(job.applicationDeadline).getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000;

  return (
    <Link
      href={job.slug ? `/jobs/${job.slug}` : "#"}
      className="group block rounded-2xl bg-zinc-900 border border-zinc-800 p-5 hover:border-zinc-600 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-zinc-500 mb-0.5">{job.company.name}</p>
          <h3 className="text-base font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
            {job.title}
          </h3>
        </div>
        {deadline && (
          <span
            className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${
              isUrgent
                ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                : "border-zinc-700 text-zinc-400"
            }`}
          >
            {deadline}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
        {job.location && (
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M6 1a3.5 3.5 0 0 1 3.5 3.5C9.5 7.5 6 11 6 11S2.5 7.5 2.5 4.5A3.5 3.5 0 0 1 6 1z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <circle cx="6" cy="4.5" r="1" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            {job.location}
          </span>
        )}
        {job.workplaceType && (
          <span className="rounded-md border border-zinc-700 px-2 py-0.5">
            {workplaceLabels[job.workplaceType] ?? job.workplaceType}
          </span>
        )}
        {job.employmentType && (
          <span className="rounded-md border border-zinc-700 px-2 py-0.5">
            {employmentLabels[job.employmentType] ?? job.employmentType}
          </span>
        )}
        {salary && (
          <span className="rounded-md border border-emerald-800/60 bg-emerald-900/20 px-2 py-0.5 text-emerald-400">
            {salary}
          </span>
        )}
      </div>

      {job.requiredSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.requiredSkills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300"
            >
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 5 && (
            <span className="text-xs text-zinc-500">+{job.requiredSkills.length - 5} more</span>
          )}
        </div>
      )}
    </Link>
  );
}
