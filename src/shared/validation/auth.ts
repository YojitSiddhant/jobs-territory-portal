import { z } from "zod";

export const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, "Password must be at least 12 characters."),
  role: z.enum(["CANDIDATE", "COMPANY"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
