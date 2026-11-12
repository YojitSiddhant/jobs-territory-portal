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
      className="group w-full text-left rounded-2xl bg-white border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 mb-0.5">{application.job.company.name}</p>
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {application.job.title}
          </h3>
        </div>
        <StatusBadge status={application.status} />
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
        <span>Applied {submittedDate}</span>
        {updatedDate !== submittedDate && <span>Updated {updatedDate}</span>}
      </div>
    </button>
  );
}
