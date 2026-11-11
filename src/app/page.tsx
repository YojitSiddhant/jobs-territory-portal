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
    <main className="flex flex-1 flex-col bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-16">

        {/* Hero */}
        <section className="space-y-8 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-600">Jobs Territory</p>
          <h1 className="text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
            A trusted foundation for better careers.
          </h1>
          <p className="text-lg leading-8 text-gray-500 max-w-xl">
            Browse jobs at verified companies, track your applications, and take the next step in your career.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
              Create candidate account
            </Link>
            <Link href="/jobs" className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              Browse jobs
            </Link>
            <Link href="/login" className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              Sign in
            </Link>
          </div>
        </section>

        {/* Access panels */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </section>
      </div>
    </main>
  );
}

function AccessCard({ label, description, links }: { label: string; description: string; links: { href: string; text: string }[] }) {
  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-emerald-600 mb-1">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-300 hover:bg-white transition-colors"
          >
            {l.text}
          </Link>
        ))}
      </div>
    </div>
  );
}
