import { z } from "zod";

export const reviewReasonSchema = z.object({
  reason: z.string().trim().min(1, "A reason is required.").max(2000),
});

export const itemReviewSchema = z.object({
  decision: z.enum(["VERIFIED", "REJECTED"]),
  reason: z.string().trim().max(2000).optional(),
}).superRefine((value, ctx) => {
  if (value.decision === "REJECTED" && !value.reason) ctx.addIssue({ code: "custom", path: ["reason"], message: "A rejection reason is required." });
});

export const verificationFieldSchema = z.enum(["NAME", "REGISTRATION_NUMBER", "WEBSITE", "CONTACT_EMAIL", "PHONE", "ADDRESS", "INDUSTRY", "DESCRIPTION"]);
