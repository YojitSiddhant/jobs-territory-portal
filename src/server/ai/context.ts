import { prisma } from "@/server/db/prisma";
import { getPrivateStorage } from "@/server/storage/private-storage";
import { inflateRawSync, inflateSync } from "node:zlib";

// Keep the complete prompt below Groq's request-size limit after profile context is added.
export const maxResumeTextLength = 8_000;
const maxResumeBytes = 10 * 1024 * 1024;
export class ResumeExtractionError extends Error { status = 422; code = "RESUME_EXTRACTION_FAILED"; constructor(message: string) { super(message); this.name = "RESUME_EXTRACTION_FAILED"; } }

export async function getCandidateContext(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({ where: { userId }, include: { education: true, experience: true } });
  if (!profile) throw new Error("Candidate profile not found.");
  console.info(`AI_STAGE stage=resume_reference status=200 message=${profile.resumeKey ? "present" : "missing"}`);
  let resumeText = "No resume text was available.";
  if (profile.resumeKey) {
    try {
      const file = await getPrivateStorage().get(profile.resumeKey);
      console.info(`AI_STAGE stage=private_file status=200 message=mime_${file.contentType === "application/pdf" ? "pdf" : "other"}`);
      resumeText = extractResumeText(file.body, file.contentType);
      console.info(`AI_STAGE stage=text_extraction status=200 message=non_empty_length_${Math.min(resumeText.length, maxResumeTextLength)}`);
    } catch (error) {
      console.warn(`AI_STAGE stage=${error instanceof ResumeExtractionError ? "text_extraction" : "private_file"} status=${error instanceof Error && "status" in error ? Number(error.status) || 500 : 500} message=${error instanceof Error ? error.name : "unknown"}`);
      throw error;
    }
  }
  return {
    profile: { fullName: profile.fullName, headline: profile.headline, bio: profile.bio, location: profile.location, skills: Array.isArray(profile.skills) ? profile.skills : [] },
    education: profile.education.map((item) => ({ institution: item.institution, qualification: item.qualification, fieldOfStudy: item.fieldOfStudy, startYear: item.startYear, endYear: item.endYear, description: item.description })),
    experience: profile.experience.map((item) => ({ employer: item.employer, jobTitle: item.jobTitle, startDate: item.startDate, endDate: item.endDate, isCurrent: item.isCurrent, description: item.description })),
    resumeText: resumeText.slice(0, maxResumeTextLength),
  };
}

export function extractResumeText(body: Uint8Array, contentType: string) {
  if (!["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(contentType)) throw new ResumeExtractionError("Resume file type is not supported for analysis.");
  if (body.byteLength > maxResumeBytes) throw new ResumeExtractionError("Resume file is too large to analyze.");
  const raw = Buffer.from(body).toString("utf8");
  if (contentType === "application/pdf") {
    const pdfText = extractPdfText(body);
    const text = pdfText.replace(/\\[nrt]/g, " ").replace(/\s+/g, " ").trim();
    if (!text) throw new ResumeExtractionError("Resume text could not be extracted.");
    return text;
  }
  const text = raw.replace(/<[^>]+>/g, " ").replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
  if (!text) throw new ResumeExtractionError("Resume text could not be extracted.");
  return text;
}

function extractPdfText(body: Uint8Array) {
  const source = Buffer.from(body);
  const chunks = [source.toString("latin1")];
  for (const match of source.toString("latin1").matchAll(/stream\r?\n/g)) {
    const end = source.indexOf(Buffer.from("\nendstream"), match.index ?? 0);
    if (end < 0) continue;
    const stream = source.subarray((match.index ?? 0) + match[0].length, end);
    for (const inflate of [inflateSync, inflateRawSync]) {
      try { chunks.push(inflate(stream).toString("latin1")); break; } catch { /* uncompressed or unsupported stream */ }
    }
  }
  return chunks.flatMap((chunk) => [...chunk.matchAll(/\(([^()]*)\)/g)].map((match) => match[1])).join(" ");
}

export function publicJobContext(job: { id: string; title: string; description: string; location: string | null; workplaceType: string | null; employmentType: string | null; experienceRequirement: string | null; requiredSkills: unknown; company: { name: string } }) {
  return { id: job.id, title: job.title, description: job.description.slice(0, 6000), location: job.location, workplaceType: job.workplaceType, employmentType: job.employmentType, experienceRequirement: job.experienceRequirement, requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [], company: job.company.name };
}
