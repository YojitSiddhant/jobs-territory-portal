import { z } from "zod";

export const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, "Password must be at least 12 characters."),
});

export const candidateRegistrationSchema = registrationSchema.extend({
  fullName: z.string().trim().min(1).max(120),
});

export const companyRegistrationSchema = registrationSchema.extend({
  companyName: z.string().trim().min(1).max(160),
  contactEmail: z.string().email(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
