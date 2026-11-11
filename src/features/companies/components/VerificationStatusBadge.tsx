import type { CompanyStatus } from "../types";

const config: Record<CompanyStatus, { label: string; classes: string; dot: string }> = {
  PENDING: { label: "Pending review", classes: "border-yellow-700/50 bg-yellow-900/20 text-yellow-400", dot: "bg-yellow-400" },
  APPROVED: { label: "Approved", classes: "border-emerald-700/50 bg-emerald-900/20 text-emerald-400", dot: "bg-emerald-400" },
  REJECTED: { label: "Rejected", classes: "border-red-800/50 bg-red-900/20 text-red-400", dot: "bg-red-400" },
  SUSPENDED: { label: "Suspended", classes: "border-orange-800/50 bg-orange-900/20 text-orange-400", dot: "bg-orange-400" },
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
