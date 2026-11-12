import { requireRole } from "@/server/auth/authorization";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { assertAiRateLimit } from "@/server/ai/rate-limit";
import { analyzeCandidateResume } from "@/server/ai/service";

export async function POST() {
  try {
    const user = await requireRole("CANDIDATE");
    assertAiRateLimit(user.id, "resume-analysis");
    return apiSuccess({ analysis: await analyzeCandidateResume(user.id) });
  } catch (error) { return apiError(error); }
}
