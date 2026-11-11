export const instant = false;

import { getSessionUser } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { CompanyLoginForm } from "@/features/auth/components/CompanyLoginForm";

export const metadata = { title: "Company sign in — Jobs Territory" };

export default async function CompanyLoginPage() {
  const user = await getSessionUser();
  if (user) {
    if (user.role === "COMPANY") redirect("/company/dashboard");
    if (user.role === "CANDIDATE") redirect("/candidate/applications");
    if (user.role === "ADMIN") redirect("/admin/dashboard");
  }

  return (
    <AuthCard
      title="Company sign in"
      subtitle="Access your company dashboard."
      footer={{ text: "New company?", linkText: "Register your company", href: "/company/register" }}
    >
      <CompanyLoginForm />
    </AuthCard>
  );
}
