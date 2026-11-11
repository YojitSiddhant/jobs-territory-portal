import { getSessionUser } from "@/server/auth/session";
import { apiSuccess } from "@/server/http/api-response";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: { code: "UNAUTHENTICATED", message: "Authentication is required." } }, { status: 401 });
  return apiSuccess({ user });
}
