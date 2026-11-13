"use client";

import { useState, useCallback, useTransition, useMemo, useRef } from "react";
import { SlidersHorizontal, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
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
  const requestSequence = useRef(0);

  const load = useCallback((next: JobDiscoveryQuery) => {
    const requestId = ++requestSequence.current;
    setQuery(next);
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetchJobs(next);
        if (requestId !== requestSequence.current) return;
        setJobs(res.jobs);
        setPagination(res.pagination);
      } catch (err) {
        if (requestId !== requestSequence.current) return;
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
    <main className="min-h-screen bg-gray-50">
      <div className="page-container py-10">
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
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
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

        <div className="mt-6 min-w-0">
          <div className="min-w-0">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {isPending && <p role="status" className="mb-4 text-sm text-gray-500">Loading jobs…</p>}

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
      </div>
      <FloatingFilterButton open={showFilters} onOpenChange={setShowFilters}>
        <JobFilters query={query} onChange={handleQueryChange} onReset={handleReset} />
      </FloatingFilterButton>
    </main>
  );
}

function FloatingFilterButton({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  const [position, setPosition] = useState({ right: 24, bottom: 24 });
  const dragRef = useRef<{ pointerId: number; x: number; y: number; right: number; bottom: number } | null>(null);
  const movedRef = useRef(false);

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, right: position.right, bottom: position.bottom };
    movedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (Math.abs(event.clientX - drag.x) > 4 || Math.abs(event.clientY - drag.y) > 4) movedRef.current = true;
    setPosition({
      right: Math.max(12, Math.min(window.innerWidth - 68, drag.right - (event.clientX - drag.x))),
      bottom: Math.max(12, Math.min(window.innerHeight - 68, drag.bottom - (event.clientY - drag.y))),
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/25" onClick={() => onOpenChange(false)} aria-hidden />
      )}
      {open && (
        <section className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-white p-5 shadow-2xl" aria-label="Job filters" role="dialog" aria-modal="true">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-gray-900">Filter jobs</h2>
            <button type="button" onClick={() => onOpenChange(false)} aria-label="Close filters" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          {children}
        </section>
      )}
      <button
        type="button"
        aria-label="Open job filters. Drag to reposition."
        title="Drag or click to open filters"
        onClick={() => { if (!movedRef.current) onOpenChange(!open); movedRef.current = false; }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ right: position.right, bottom: position.bottom, touchAction: "none" }}
        className="fixed z-40 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters
      </button>
    </>
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
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
      >
        <Search className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Search</span>
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
        className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
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
        className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-30 transition-colors"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}
