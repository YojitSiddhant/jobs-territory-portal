import { prisma } from "@/server/db/prisma";
import { verifyPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";
import { safeUser } from "@/server/auth/safe-user";
import { loginSchema } from "@/shared/validation/auth";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() }, select: { id: true, email: true, role: true, passwordHash: true } });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      return Response.json({ error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." } }, { status: 401 });
    }
    const safe = safeUser(user);
    await createSession(safe);
    return apiSuccess({ user: safe });
  } catch (error) {
    return apiError(error);
  }
}
