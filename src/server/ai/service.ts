import { getAiProvider } from "./provider";
import { coverLetterSchema, matchSchema, resumeAnalysisSchema, type CoverLetter, type JobMatch, type ResumeAnalysis } from "./schemas";
import { getCandidateContext, publicJobContext } from "./context";
import { AiProviderError } from "./provider";

function prompt(task: string, payload: unknown) { return `You are a careful career assistant. Do not make hiring decisions. Return only JSON matching the requested schema. Do not include private storage keys, passwords, emails, tokens, or filesystem paths.\nTask: ${task}\nInput:\n${JSON.stringify(payload)}`; }

export function validateResumeAnalysis(value: unknown): ResumeAnalysis {
  const normalized = normalizeResumeAnalysis(value);
  const parsed = resumeAnalysisSchema.safeParse(normalized);
  if (!parsed.success) { const issues = parsed.error.issues.map((issue) => `${issue.path.join(".") || "root"}:${issue.code}`).join(","); console.warn(`AI_STAGE stage=zod_validation status=502 message=invalid-resume-analysis-${issues}`); throw new AiProviderError("The AI provider returned an invalid resume analysis."); }
  console.info("AI_STAGE stage=zod_validation status=200 message=resume-analysis-valid");
  return parsed.data;
}

function normalizeResumeAnalysis(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  const listFields = ["skills", "education", "experience", "strengths", "missingInformation", "suggestions"];
  return Object.fromEntries(Object.entries(record).map(([key, item]) => [key, listFields.includes(key) && Array.isArray(item) ? item.map((entry) => {
    if (typeof entry === "string") return entry;
    if (!entry || typeof entry !== "object") return String(entry);
    return Object.entries(entry as Record<string, unknown>).map(([field, fieldValue]) => `${field}: ${typeof fieldValue === "string" ? fieldValue : JSON.stringify(fieldValue)}`).join("; ");
  }) : item]));
}

export async function analyzeCandidateResume(userId: string): Promise<ResumeAnalysis> {
  const context = await getCandidateContext(userId);
  const requestPrompt = prompt("Analyze this candidate resume and profile with summary, skills, education, experience, strengths, missingInformation, and suggestions. Keep every list concise and return exactly the requested JSON object.", context);
  console.info(`AI_STAGE stage=groq_request status=200 message=prompt_length_${requestPrompt.length}`);
  const result = await getAiProvider().generateJson(requestPrompt);
  console.info("AI_STAGE stage=json_parse status=200 message=provider-json-parsed");
  return validateResumeAnalysis(result);
}

export async function matchCandidateToJob(userId: string, job: Parameters<typeof publicJobContext>[0]): Promise<JobMatch> {
  const context = await getCandidateContext(userId);
  return matchSchema.parse(await getAiProvider().generateJson(prompt("Compare the candidate to this job. Return score from 0 to 100, matchedSkills, missingSkills, and explanation. This is informational and must not be a hiring decision.", { candidate: context, job: publicJobContext(job) })));
}

export async function generateCoverLetter(userId: string, job: Parameters<typeof publicJobContext>[0]): Promise<CoverLetter> {
  const context = await getCandidateContext(userId);
  return coverLetterSchema.parse(await getAiProvider().generateJson(prompt("Write a truthful, job-specific professional cover letter. Do not invent qualifications. Return coverLetter only, between 100 and 4000 characters.", { candidate: context, job: publicJobContext(job) })));
}
