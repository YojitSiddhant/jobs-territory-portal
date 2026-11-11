import { Prisma } from "@prisma/client";
import { candidateRegistrationSchema } from "@/shared/validation/auth";
import { prisma } from "@/server/db/prisma";
import { hashPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";
import { safeUser } from "@/server/auth/safe-user";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";

export async function POST(request: Request) {
  try {
    const input = candidateRegistrationSchema.parse(await request.json());
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash: await hashPassword(input.password),
          role: "CANDIDATE",
          candidateProfile: { create: { fullName: input.fullName } },
        },
        select: { id: true, email: true, role: true },
      });
      return created;
    });
    await createSession(user);
    return apiSuccess({ user: safeUser(user) }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: { code: "EMAIL_ALREADY_EXISTS", message: "An account with this email already exists." } }, { status: 409 });
    }
    return apiError(error);
  }
}
