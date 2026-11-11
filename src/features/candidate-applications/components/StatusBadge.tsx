import type { ApplicationStatus } from "../types";

const config: Record<ApplicationStatus, { label: string; classes: string }> = {
  APPLIED: { label: "Applied", classes: "border-blue-200 bg-blue-50 text-blue-600" },
  REVIEWING: { label: "In review", classes: "border-yellow-200 bg-yellow-50 text-yellow-600" },
  SHORTLISTED: { label: "Shortlisted", classes: "border-emerald-200 bg-emerald-50 text-emerald-600" },
  REJECTED: { label: "Not selected", classes: "border-red-200 bg-red-50 text-red-600" },
  HIRED: { label: "Hired", classes: "border-emerald-200 bg-emerald-100 text-emerald-700" },
  WITHDRAWN: { label: "Withdrawn", classes: "border-gray-200 bg-gray-100 text-gray-500" },
};

type Props = { status: ApplicationStatus };

export function StatusBadge({ status }: Props) {
  const { label, classes } = config[status] ?? {
    label: status,
    classes: "border-gray-200 text-gray-500",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
