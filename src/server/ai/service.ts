import { getAiProvider } from "./provider";
import { coverLetterSchema, matchSchema, recommendationsSchema, resumeAnalysisSchema, type CoverLetter, type JobMatch, type Recommendation, type ResumeAnalysis } from "./schemas";
import { getCandidateContext, publicJobContext } from "./context";

function prompt(task: string, payload: unknown) { return `You are a careful career assistant. Do not make hiring decisions. Return only JSON matching the requested schema. Do not include private storage keys, passwords, emails, tokens, or filesystem paths.\nTask: ${task}\nInput:\n${JSON.stringify(payload)}`; }

export async function analyzeCandidateResume(userId: string): Promise<ResumeAnalysis> {
  const context = await getCandidateContext(userId);
  return resumeAnalysisSchema.parse(await getAiProvider().generateJson(prompt("Analyze this candidate resume and profile with summary, skills, education, experience, strengths, missingInformation, and suggestions.", context)));
}

export async function recommendJobs(userId: string, jobs: unknown[]): Promise<Recommendation[]> {
  const context = await getCandidateContext(userId);
  const result = recommendationsSchema.parse(await getAiProvider().generateJson(prompt("Rank only these jobs for this candidate. Return jobId, matchPercentage, reasons, matchingSkills, and missingSkills.", { candidate: context, jobs })));
  const allowed = new Set(jobs.map((job) => (job as { id: string }).id));
  return result.filter((item) => allowed.has(item.jobId));
}

export async function matchCandidateToJob(userId: string, job: Parameters<typeof publicJobContext>[0]): Promise<JobMatch> {
  const context = await getCandidateContext(userId);
  return matchSchema.parse(await getAiProvider().generateJson(prompt("Compare the candidate to this job. Return score from 0 to 100, matchedSkills, missingSkills, and explanation. This is informational and must not be a hiring decision.", { candidate: context, job: publicJobContext(job) })));
}

export async function generateCoverLetter(userId: string, job: Parameters<typeof publicJobContext>[0]): Promise<CoverLetter> {
  const context = await getCandidateContext(userId);
  return coverLetterSchema.parse(await getAiProvider().generateJson(prompt("Write a truthful, job-specific professional cover letter. Do not invent qualifications. Return coverLetter only, between 100 and 4000 characters.", { candidate: context, job: publicJobContext(job) })));
}
