export const instant = false;

import { getSessionUser } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { CandidateRegisterForm } from "@/features/auth/components/CandidateRegisterForm";

export const metadata = { title: "Create account — Jobs Territory" };

export default async function CandidateRegisterPage() {
  const user = await getSessionUser();
  if (user) {
    if (user.role === "CANDIDATE") redirect("/candidate/applications");
    if (user.role === "COMPANY") redirect("/company/dashboard");
    if (user.role === "ADMIN") redirect("/admin/dashboard");
  }

  return (
    <AuthCard
      title="Create a candidate account"
      subtitle="Find jobs at verified companies."
      footer={{ text: "Already have an account?", linkText: "Sign in", href: "/login" }}
    >
      <CandidateRegisterForm />
    </AuthCard>
  );
}
