import { z } from "zod";

const year = z.number().int().min(1900).max(new Date().getFullYear() + 10);
const fileKey = z.string().regex(/^private\/candidates\/[^/]+\/(profile-photo|resume)\/[^/]+$/, "File reference must point to private candidate storage.");

export const educationSchema = z.object({
  institution: z.string().trim().min(1).max(160),
  qualification: z.string().trim().min(1).max(160),
  fieldOfStudy: z.string().trim().max(160).optional().nullable(),
  startYear: year.optional().nullable(),
  endYear: year.optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
}).refine((value) => !value.startYear || !value.endYear || value.endYear >= value.startYear, { message: "End year cannot be before start year." });

export const experienceSchema = z.object({
  employer: z.string().trim().min(1).max(160),
  jobTitle: z.string().trim().min(1).max(160),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().max(5000).optional().nullable(),
}).refine((value) => value.isCurrent || Boolean(value.endDate), { message: "Current experience must be marked or include an end date.", path: ["endDate"] })
  .refine((value) => !value.endDate || value.endDate >= value.startDate, { message: "End date cannot be before start date.", path: ["endDate"] });

export const candidateProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  headline: z.string().trim().max(160).optional().nullable(),
  bio: z.string().trim().max(5000).optional().nullable(),
  location: z.string().trim().max(160).optional().nullable(),
  profilePhotoKey: fileKey.optional().nullable(),
  resumeKey: fileKey.optional().nullable(),
  skills: z.array(z.string().trim().min(1).max(80)).max(50).optional().nullable(),
  education: z.array(educationSchema).max(20).optional(),
  experience: z.array(experienceSchema).max(30).optional(),
});
