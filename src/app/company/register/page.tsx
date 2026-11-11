export const instant = false;

import { getSessionUser } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { CompanyRegisterForm } from "@/features/auth/components/CompanyRegisterForm";

export const metadata = { title: "Register your company — Jobs Territory" };

export default async function CompanyRegisterPage() {
  const user = await getSessionUser();
  if (user) {
    if (user.role === "COMPANY") redirect("/company/dashboard");
    if (user.role === "CANDIDATE") redirect("/candidate/applications");
    if (user.role === "ADMIN") redirect("/admin/dashboard");
  }

  return (
    <AuthCard
      title="Register your company"
      subtitle="Post jobs and find great candidates."
      footer={{ text: "Already registered?", linkText: "Sign in", href: "/company/login" }}
    >
      <CompanyRegisterForm />
    </AuthCard>
  );
}
