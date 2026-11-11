import type { CompanyStatus } from "../types";

const config: Record<CompanyStatus, { label: string; classes: string; dot: string }> = {
  PENDING: { label: "Pending review", classes: "border-yellow-200 bg-yellow-50 text-yellow-600", dot: "bg-yellow-500" },
  APPROVED: { label: "Approved", classes: "border-emerald-200 bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
  REJECTED: { label: "Rejected", classes: "border-red-200 bg-red-50 text-red-600", dot: "bg-red-500" },
  SUSPENDED: { label: "Suspended", classes: "border-orange-200 bg-orange-50 text-orange-600", dot: "bg-orange-500" },
};

export function VerificationStatusBadge({ status }: { status: CompanyStatus }) {
  const { label, classes, dot } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}
