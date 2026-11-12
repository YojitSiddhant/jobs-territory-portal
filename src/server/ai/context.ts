import { prisma } from "@/server/db/prisma";
import { getPrivateStorage } from "@/server/storage/private-storage";

export async function getCandidateContext(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({ where: { userId }, include: { education: true, experience: true } });
  if (!profile) throw new Error("Candidate profile not found.");
  let resumeText = "No resume text was available.";
  if (profile.resumeKey) {
    const file = await getPrivateStorage().get(profile.resumeKey);
    resumeText = extractResumeText(file.body, file.contentType);
  }
  return {
    profile: { fullName: profile.fullName, headline: profile.headline, bio: profile.bio, location: profile.location, skills: Array.isArray(profile.skills) ? profile.skills : [] },
    education: profile.education.map((item) => ({ institution: item.institution, qualification: item.qualification, fieldOfStudy: item.fieldOfStudy, startYear: item.startYear, endYear: item.endYear, description: item.description })),
    experience: profile.experience.map((item) => ({ employer: item.employer, jobTitle: item.jobTitle, startDate: item.startDate, endDate: item.endDate, isCurrent: item.isCurrent, description: item.description })),
    resumeText: resumeText.slice(0, 30_000),
  };
}

function extractResumeText(body: Uint8Array, contentType: string) {
  const raw = Buffer.from(body).toString("utf8");
  if (contentType === "application/pdf") {
    const pdfText = [...raw.matchAll(/\(([^()]*)\)/g)].map((match) => match[1]).join(" ");
    return pdfText.replace(/\\[nrt]/g, " ").replace(/\s+/g, " ").trim() || "The resume file could not be text-extracted.";
  }
  return raw.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim() || "The resume file could not be text-extracted.";
}

export function publicJobContext(job: { id: string; title: string; description: string; location: string | null; workplaceType: string | null; employmentType: string | null; experienceRequirement: string | null; requiredSkills: unknown; company: { name: string } }) {
  return { id: job.id, title: job.title, description: job.description.slice(0, 6000), location: job.location, workplaceType: job.workplaceType, employmentType: job.employmentType, experienceRequirement: job.experienceRequirement, requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [], company: job.company.name };
}
