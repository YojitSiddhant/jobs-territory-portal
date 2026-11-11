import type { Application } from "../types";
import { StatusBadge } from "./StatusBadge";

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
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-zinc-500 mb-0.5">{application.job.company.name}</p>
          <h2 className="text-lg font-semibold text-zinc-100">{application.job.title}</h2>
          <p className="text-xs text-zinc-500 mt-1">Applied {submittedDate}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close application detail"
          className="shrink-0 rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Current status */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400">Status:</span>
        <StatusBadge status={application.status} />
      </div>

      {/* Cover letter */}
      {application.coverNote && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">Cover letter</h3>
          <div className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {application.coverNote}
          </div>
        </div>
      )}

      {/* Status history */}
      {application.statusHistory.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Timeline</h3>
          <ol className="relative border-l border-zinc-700 ml-2 space-y-4">
            {application.statusHistory.map((entry, i) => (
              <li key={i} className="ml-4">
                <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full border border-zinc-700 bg-zinc-900" />
                <div className="flex items-center gap-2">
                  <StatusBadge status={entry.status} />
                  <span className="text-xs text-zinc-500">
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
      <a
        href={application.job.slug ? `/jobs/${application.job.slug}` : "/jobs"}
        className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        View job listing
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2.5 6h7M6 2.5L9.5 6 6 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
}
