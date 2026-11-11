export const instant = false;

import { getSessionUser } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AdminLoginForm } from "@/features/auth/components/AdminLoginForm";

export const metadata = { title: "Admin sign in — Jobs Territory" };

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user?.role === "ADMIN") redirect("/admin/dashboard");

  return (
    <AuthCard title="Admin access" subtitle="Restricted to authorized administrators.">
      <AdminLoginForm />
    </AuthCard>
  );
}
