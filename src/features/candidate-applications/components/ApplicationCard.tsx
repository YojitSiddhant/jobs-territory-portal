import type { Application } from "../types";
import { StatusBadge } from "./StatusBadge";

type Props = {
  application: Application;
  onClick: () => void;
};

export function ApplicationCard({ application, onClick }: Props) {
  const submittedDate = new Date(application.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const updatedDate = new Date(application.updatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left rounded-2xl bg-zinc-900 border border-zinc-800 p-5 hover:border-zinc-600 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-zinc-500 mb-0.5">{application.job.company.name}</p>
          <h3 className="text-base font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
            {application.job.title}
          </h3>
        </div>
        <StatusBadge status={application.status} />
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
        <span>Applied {submittedDate}</span>
        {updatedDate !== submittedDate && <span>Updated {updatedDate}</span>}
      </div>
    </button>
  );
}
