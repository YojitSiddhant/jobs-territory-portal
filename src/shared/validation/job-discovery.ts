import { z } from "zod";

const optionalNumber = z.preprocess((value) => value === undefined || value === "" ? undefined : value, z.coerce.number().finite().nonnegative().optional());

export const jobDiscoveryQuerySchema = z.object({
  q: z.string().trim().max(120).optional(), location: z.string().trim().max(180).optional(),
  workplaceType: z.enum(["ONSITE", "HYBRID", "REMOTE"]).optional(), employmentType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"]).optional(),
  experience: z.string().trim().max(160).optional(), skill: z.string().trim().max(80).optional(), company: z.string().trim().max(160).optional(),
  salaryMin: optionalNumber, salaryMax: optionalNumber, page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(50).default(20), sort: z.enum(["newest", "deadline"]).default("newest"),
}).refine((value) => value.salaryMin === undefined || value.salaryMax === undefined || value.salaryMax >= value.salaryMin, { message: "salaryMax cannot be below salaryMin.", path: ["salaryMax"] });

export function normalizeDiscoveryQuery(searchParams: URLSearchParams) {
  return jobDiscoveryQuerySchema.parse(Object.fromEntries(searchParams.entries()));
}
