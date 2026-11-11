import type { Application } from "./types";

export async function fetchMyApplications(): Promise<Application[]> {
  const res = await fetch("/api/candidate/applications");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load applications.");
  return (data.applications ?? []) as Application[];
}
