import type { Application } from "../types";
import { StatusBadge } from "./StatusBadge";
import Link from "next/link";

type Props = {
  application: Application;
  onClose: () => void;
};

export function ApplicationDetail({ application, onClose }: Props) {
  const submittedDate = new Date(application.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{application.job.company.name}</p>
          <h2 className="text-lg font-semibold text-gray-900">{application.job.title}</h2>
          <p className="text-xs text-gray-400 mt-1">Applied {submittedDate}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close application detail"
          className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-900 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Current status */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Status:</span>
        <StatusBadge status={application.status} />
      </div>

      {/* Cover letter */}
      {application.coverNote && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Cover letter</h3>
          <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {application.coverNote}
          </div>
        </div>
      )}

      {/* Status history */}
      {application.statusHistory.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Timeline</h3>
          <ol className="relative border-l border-gray-200 ml-2 space-y-4">
            {application.statusHistory.map((entry, i) => (
              <li key={i} className="ml-4">
                <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full border border-gray-200 bg-white" />
                <div className="flex items-center gap-2">
                  <StatusBadge status={entry.status} />
                  <span className="text-xs text-gray-400">
                    {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* View job link */}
      <Link
        href={application.job.slug ? `/jobs/${application.job.slug}` : "/jobs"}
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-500 transition-colors"
      >
        View job listing
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2.5 6h7M6 2.5L9.5 6 6 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}
