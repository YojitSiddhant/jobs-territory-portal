import { requireRole } from "@/server/auth/authorization";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { assertAiRateLimit } from "@/server/ai/rate-limit";
import { analyzeCandidateResume } from "@/server/ai/service";

export async function POST() {
  try {
    const user = await requireRole("CANDIDATE");
    console.info("AI_STAGE stage=authorization status=200 message=candidate-authorized");
    assertAiRateLimit(user.id, "resume-analysis");
    return apiSuccess({ analysis: await analyzeCandidateResume(user.id) });
  } catch (error) { if (error instanceof Error && "status" in error && [401, 403].includes(Number(error.status))) console.warn(`AI_STAGE stage=authorization status=${Number(error.status)} message=${error.name}`); return apiError(error); }
}
