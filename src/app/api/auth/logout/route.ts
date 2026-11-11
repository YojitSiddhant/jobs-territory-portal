import { destroySession } from "@/server/auth/session";
import { apiMessage } from "@/server/http/api-response";

export async function POST() {
  await destroySession();
  return apiMessage("Logged out successfully.");
}
