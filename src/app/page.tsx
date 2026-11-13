export const instant = false;

import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getSessionUser();
  if (user?.role === "CANDIDATE") redirect("/candidate/applications");
  if (user?.role === "COMPANY") redirect("/company/dashboard");
  if (user?.role === "ADMIN") redirect("/admin/dashboard");

  return (
    <main className="flex flex-1 flex-col bg-white">
      {/* Hero */}
      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 via-white to-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="page-container space-y-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Trusted job platform
            </div>
            <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              A trusted foundation<br className="hidden sm:block" /> for better careers.
            </h1>
            <p className="mx-auto max-w-xl text-lg leading-8 text-gray-600">
              Browse jobs at verified companies, track your applications, and take the next step in your career.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/register" className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm shadow-blue-200">
                Create candidate account
              </Link>
              <Link href="/jobs" className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm">
                Browse jobs
              </Link>
              <Link href="/login" className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors">
                Sign in
              </Link>
            </div>
          </div>
      </section>

      {/* Access panels */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="page-container">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">Access by role</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AccessCard
              label="Candidates"
              description="Find jobs, track applications, and build your career."
              links={[
                { href: "/register", text: "Create account" },
                { href: "/login", text: "Sign in" },
              ]}
            />
            <AccessCard
              label="Companies"
              description="Post jobs, review applicants, and grow your team."
              links={[
                { href: "/company/register", text: "Register company" },
                { href: "/company/login", text: "Sign in" },
              ]}
            />
            <AccessCard
              label="Administrators"
              description="Manage platform, verify companies, and review activity."
              links={[
                { href: "/admin/login", text: "Admin sign in" },
              ]}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function AccessCard({ label, description, links }: { label: string; description: string; links: { href: string; text: string }[] }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-4 hover:border-blue-200 hover:shadow-sm transition-all">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">{label}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            {l.text}
          </Link>
        ))}
      </div>
    </div>
  );
}
