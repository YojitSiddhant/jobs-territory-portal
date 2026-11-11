import { z } from "zod";

const baseJobSchema = z.object({
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1).max(20000),
  location: z.string().trim().max(180).optional().nullable(),
  workplaceType: z.enum(["ONSITE", "HYBRID", "REMOTE"]),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"]),
  experienceRequirement: z.string().trim().min(1).max(160),
  requiredSkills: z.array(z.string().trim().min(1).max(80)).min(1).max(50),
  salaryMin: z.coerce.number().finite().nonnegative().optional().nullable(),
  salaryMax: z.coerce.number().finite().nonnegative().optional().nullable(),
  applicationDeadline: z.coerce.date().optional().nullable(),
});

const salaryRangeRefinement = (value: { salaryMin?: number | null; salaryMax?: number | null }) => value.salaryMin === null || value.salaryMax === null || value.salaryMin === undefined || value.salaryMax === undefined || value.salaryMax >= value.salaryMin;
export const jobCreateSchema = baseJobSchema.refine(salaryRangeRefinement, { message: "Salary maximum cannot be below salary minimum.", path: ["salaryMax"] });
export const jobUpdateSchema = baseJobSchema.partial().refine(salaryRangeRefinement, { message: "Salary maximum cannot be below salary minimum.", path: ["salaryMax"] });
export const jobPublishSchema = baseJobSchema.refine(salaryRangeRefinement, { message: "Salary maximum cannot be below salary minimum.", path: ["salaryMax"] }).refine((value) => !value.applicationDeadline || value.applicationDeadline > new Date(), { message: "Application deadline must be in the future when publishing.", path: ["applicationDeadline"] });
