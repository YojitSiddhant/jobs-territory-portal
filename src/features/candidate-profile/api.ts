import type { CandidateProfile, ProfileUpdateInput } from "./types";

export async function fetchProfile(): Promise<CandidateProfile> {
  const res = await fetch("/api/candidate/profile");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load profile.");
  return data.profile as CandidateProfile;
}

export async function updateProfile(input: ProfileUpdateInput): Promise<CandidateProfile> {
  const res = await fetch("/api/candidate/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to save profile.");
  return data.profile as CandidateProfile;
}

export async function uploadCandidateFile(kind: "profile-photo" | "resume", file: File): Promise<{ key: string }> {
  const form = new FormData(); form.set("kind", kind); form.set("file", file);
  const res = await fetch("/api/candidate/profile/files", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to upload file.");
  return { key: data.key as string };
}
