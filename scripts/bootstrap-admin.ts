import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { hashPassword } from "@/server/auth/password";
import { canPromoteExistingUser, normalizeAdminEmail } from "@/server/admin/bootstrap";

const emailSchema = z.string().trim().email();
const passwordSchema = z.string().min(12, "Admin password must be at least 12 characters.");

async function main() {
  const rl = createInterface({ input, output });
  try {
    const email = normalizeAdminEmail(process.env.ADMIN_EMAIL ?? await rl.question("Local admin email: "));
    const password = process.env.ADMIN_PASSWORD ?? await rl.question("Local admin password: ");
    const confirmed = process.env.CONFIRM_PROMOTE_TO_ADMIN === "YES" || (await rl.question("If this email belongs to a non-admin user, type PROMOTE to confirm: ")) === "PROMOTE";
    const validEmail = emailSchema.safeParse(email);
    const validPassword = passwordSchema.safeParse(password);
    if (!validEmail.success) throw new Error("ADMIN_EMAIL must be a valid email address.");
    if (!validPassword.success) throw new Error(validPassword.error.issues[0]?.message ?? "Invalid admin password.");

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (existing && !canPromoteExistingUser(existing.role, confirmed)) throw new Error("The email belongs to a non-admin user. Set CONFIRM_PROMOTE_TO_ADMIN=YES to explicitly promote it.");
    const passwordHash = await hashPassword(password);
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: { passwordHash, role: "ADMIN" } });
      console.log("Local admin credentials updated.");
    } else {
      await prisma.user.create({ data: { email, passwordHash, role: "ADMIN" } });
      console.log("Local admin user created.");
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Admin bootstrap failed."); process.exitCode = 1; });
