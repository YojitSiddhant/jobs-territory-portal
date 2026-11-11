import { z } from "zod";

export const applicationCreateSchema = z.object({
  coverNote: z.string().trim().max(10000).optional().nullable(),
});

export const applicationStatusSchema = z.object({
  status: z.enum(["REVIEWING", "SHORTLISTED", "REJECTED", "HIRED"]),
});
