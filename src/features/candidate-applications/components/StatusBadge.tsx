import type { ApplicationStatus } from "../types";

const config: Record<ApplicationStatus, { label: string; classes: string }> = {
  APPLIED: { label: "Applied", classes: "border-blue-800/40 bg-blue-900/20 text-blue-400" },
  REVIEWING: { label: "In review", classes: "border-yellow-800/40 bg-yellow-900/20 text-yellow-400" },
  SHORTLISTED: { label: "Shortlisted", classes: "border-emerald-700/40 bg-emerald-900/20 text-emerald-400" },
  REJECTED: { label: "Not selected", classes: "border-red-800/40 bg-red-900/20 text-red-400" },
  HIRED: { label: "Hired", classes: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
  WITHDRAWN: { label: "Withdrawn", classes: "border-zinc-700 bg-zinc-800 text-zinc-500" },
};

type Props = { status: ApplicationStatus };

export function StatusBadge({ status }: Props) {
  const { label, classes } = config[status] ?? {
    label: status,
    classes: "border-zinc-700 text-zinc-400",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
