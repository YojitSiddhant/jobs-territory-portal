import type { CandidateProfile, ProfileUpdateInput } from "./types";

export function emptyCandidateProfile(): CandidateProfile {
  const now = new Date().toISOString();
  return { id: "", fullName: null, phone: null, headline: null, bio: null, location: null, profilePhotoKey: null, resumeKey: null, skills: [], education: [], experience: [], completionPercentage: 0, createdAt: now, updatedAt: now };
}

export function normalizeCandidateProfile(value: Partial<CandidateProfile> | null | undefined): CandidateProfile {
  const base = emptyCandidateProfile();
  return { ...base, ...value, skills: Array.isArray(value?.skills) ? value.skills : [], education: Array.isArray(value?.education) ? value.education : [], experience: Array.isArray(value?.experience) ? value.experience : [], completionPercentage: typeof value?.completionPercentage === "number" ? value.completionPercentage : 0 };
}

function profileFromResponse(data: unknown): CandidateProfile {
  const profile = (data as { data?: { profile?: Partial<CandidateProfile> } } | null)?.data?.profile;
  if (!profile) throw new Error("The profile response was incomplete. Your changes were not discarded.");
  return normalizeCandidateProfile(profile);
}

export async function fetchProfile(): Promise<CandidateProfile> {
  const res = await fetch("/api/candidate/profile");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load profile.");
  return profileFromResponse(data);
}

export async function updateProfile(input: ProfileUpdateInput): Promise<CandidateProfile> {
  const res = await fetch("/api/candidate/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to save profile.");
  return profileFromResponse(data);
}

export async function uploadCandidateFile(kind: "profile-photo" | "resume", file: File, onProgress?: (percentage: number) => void): Promise<{ key: string }> {
  const form = new FormData(); form.set("kind", kind); form.set("file", file);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/candidate/profile/files");
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100)); };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
    xhr.onload = () => { try { resolve(parseUploadResponse(xhr.status, xhr.responseText)); } catch (error) { reject(error); } };
    xhr.send(form);
  });
}

export function privateFileUrl(key: string | null | undefined) {
  if (!key) return null;
  return `/api/private-files/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export function parseUploadResponse(status: number, responseText: string) {
  let data: { data?: { key?: string }; error?: { message?: string } } = {};
  try { data = JSON.parse(responseText); } catch { /* handled below */ }
  const key = data.data?.key;
  if (status < 200 || status >= 300 || !key) throw new Error(data.error?.message ?? "Upload failed.");
  return { key };
}
