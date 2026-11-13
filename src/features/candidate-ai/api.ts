export type ResumeAnalysis = { summary: string; skills: string[]; education: string[]; experience: string[]; strengths: string[]; missingInformation: string[]; suggestions: string[] };
export type JobMatch = { score: number; matchedSkills: string[]; missingSkills: string[]; explanation: string };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message ?? "AI request failed.");
  return data.data as T;
}

export async function analyzeResume() { return (await request<{ analysis: ResumeAnalysis }>("/api/candidate/ai/resume-analysis", { method: "POST" })).analysis; }
export async function fetchJobMatch(jobId: string) { return (await request<{ match: JobMatch }>("/api/candidate/ai/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }) })).match; }
export async function generateCoverLetter(jobId: string) { return (await request<{ result: { coverLetter: string } }>("/api/candidate/ai/cover-letter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }) })).result.coverLetter; }
