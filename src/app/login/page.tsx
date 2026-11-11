export const instant = false;

import { getSessionUser } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { CandidateLoginForm } from "@/features/auth/components/CandidateLoginForm";

export const metadata = { title: "Sign in — Jobs Territory" };

export default async function CandidateLoginPage() {
  const user = await getSessionUser();
  if (user) {
    if (user.role === "CANDIDATE") redirect("/candidate/applications");
    if (user.role === "COMPANY") redirect("/company/dashboard");
    if (user.role === "ADMIN") redirect("/admin/dashboard");
  }

  return (
    <AuthCard
      title="Sign in to your account"
      subtitle="Welcome back. Sign in to continue."
      footer={{ text: "Don't have an account?", linkText: "Create one", href: "/register" }}
    >
      <CandidateLoginForm />
    </AuthCard>
  );
}
