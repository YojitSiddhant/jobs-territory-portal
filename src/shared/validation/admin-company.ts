import { z } from "zod";

export const reviewReasonSchema = z.object({
  reason: z.string().trim().min(1, "A reason is required.").max(2000),
});
