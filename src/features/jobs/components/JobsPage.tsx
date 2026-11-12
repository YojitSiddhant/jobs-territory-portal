"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import type { PublicJob, Pagination, JobDiscoveryQuery } from "../types";
import { fetchJobs } from "../api";
import { JobCard } from "./JobCard";
import { JobFilters } from "./JobFilters";

type Props = {
  initialJobs: PublicJob[];
  initialPagination: Pagination;
  initialQuery: JobDiscoveryQuery;
};

export function JobsPage({ initialJobs, initialPagination, initialQuery }: Props) {
  const now = useMemo(() => new Date(), []);
  const [jobs, setJobs] = useState(initialJobs);
  const [pagination, setPagination] = useState(initialPagination);
  const [query, setQuery] = useState<JobDiscoveryQuery>(initialQuery);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback((next: JobDiscoveryQuery) => {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetchJobs(next);
        setJobs(res.jobs);
        setPagination(res.pagination);
        setQuery(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs.");
      }
    });
  }, []);

  function handleQueryChange(patch: Partial<JobDiscoveryQuery>) {
    load({ ...query, ...patch });
  }

  function handleReset() {
    load({ sort: query.sort, page: 1, pageSize: query.pageSize });
  }

  function handleSearch(q: string) {
    load({ ...query, q: q || undefined, page: 1 });
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600 mb-1">
            Jobs Territory
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Find your next role</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination.total > 0 ? `${pagination.total} open position${pagination.total !== 1 ? "s" : ""}` : "Browse open positions"}
          </p>
        </div>

        {/* Search bar */}
        <SearchBar defaultValue={query.q ?? ""} onSearch={handleSearch} isPending={isPending} />

        {/* Sort + filter toggle */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="lg:hidden flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Filters
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-400">Sort:</span>
            <SortButton
              active={query.sort !== "deadline"}
              onClick={() => handleQueryChange({ sort: "newest", page: 1 })}
            >
              Newest
            </SortButton>
            <SortButton
              active={query.sort === "deadline"}
              onClick={() => handleQueryChange({ sort: "deadline", page: 1 })}
            >
              Deadline
            </SortButton>
          </div>
        </div>

        <div className="mt-6 flex gap-8">
          {/* Filters sidebar */}
          <div className={`lg:block w-64 shrink-0 ${showFilters ? "block" : "hidden"}`}>
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5">
              <JobFilters query={query} onChange={handleQueryChange} onReset={handleReset} />
            </div>
          </div>

          {/* Jobs list */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className={`space-y-3 ${isPending ? "opacity-60 pointer-events-none" : ""} transition-opacity`}>
              {jobs.length === 0 && !isPending ? (
                <EmptyState hasFilters={Boolean(query.q || query.location || query.workplaceType || query.employmentType || query.skill || query.company)} onReset={handleReset} />
              ) : (
                jobs.map((job) => <JobCard key={job.id} job={job} now={now} />)
              )}
            </div>

            {pagination.totalPages > 1 && (
              <Pagination
                current={pagination.page}
                total={pagination.totalPages}
                onPage={(p) => handleQueryChange({ page: p })}
                isPending={isPending}
              />
            )}
          </div>
        </div>
    </main>
  );
}

function SearchBar({
  defaultValue,
  onSearch,
  isPending,
}: {
  defaultValue: string;
  onSearch: (q: string) => void;
  isPending: boolean;
}) {
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="search"
        aria-label="Search jobs"
        placeholder="Search by title, description, company, or skill…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
      >
        Search
      </button>
    </form>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-blue-50 text-blue-600 border border-blue-200"
          : "text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
      <p className="text-sm font-medium text-gray-700">No jobs found</p>
      <p className="mt-1 text-xs text-gray-400">
        {hasFilters ? "Try adjusting your search or filters." : "Check back soon for new openings."}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function Pagination({
  current,
  total,
  onPage,
  isPending,
}: {
  current: number;
  total: number;
  onPage: (p: number) => void;
  isPending: boolean;
}) {
  const pages: (number | "…")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("…");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("…");
    pages.push(total);
  }

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1.5">
      <button
        type="button"
        disabled={current === 1 || isPending}
        onClick={() => onPage(current - 1)}
        aria-label="Previous page"
        className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-30 transition-colors"
      >
        ←
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            disabled={isPending}
            aria-current={p === current ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              p === current
                ? "bg-blue-50 border border-blue-200 text-blue-600"
                : "border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        disabled={current === total || isPending}
        onClick={() => onPage(current + 1)}
        aria-label="Next page"
        className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-30 transition-colors"
      >
        →
      </button>
    </nav>
  );
}
