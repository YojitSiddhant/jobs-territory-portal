import { z } from "zod";

const text = z.string().trim().max(4000);
const list = z.array(z.string().trim().min(1).max(160)).max(30);

export const resumeAnalysisSchema = z.object({ summary: text, skills: list, education: list, experience: list, strengths: list, missingInformation: list, suggestions: list });
export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;


export const matchSchema = z.object({ score: z.number().int().min(0).max(100), matchedSkills: list.max(30), missingSkills: list.max(30), explanation: text });
export type JobMatch = z.infer<typeof matchSchema>;

export const coverLetterSchema = z.object({ coverLetter: z.string().trim().min(100).max(4000) });
export type CoverLetter = z.infer<typeof coverLetterSchema>;
