import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { LogoutButton } from "./LogoutButton";
import { CandidateNavLinks } from "./CandidateNavLinks";

export async function SiteNav() {
  const user = await getSessionUser();

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors">
          Jobs Territory
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {!user && (
            <>
              <Link href="/jobs" className={linkCls}>Browse jobs</Link>
              <Link href="/login" className={linkCls}>Sign in</Link>
              <Link href="/register" className={ctaCls}>Get started</Link>
            </>
          )}

          {user?.role === "CANDIDATE" && (
            <CandidateNavLinks />
          )}

          {user?.role === "COMPANY" && (
            <>
              <Link href="/company/dashboard" className={linkCls}>Dashboard</Link>
              <Link href="/company/jobs" className={linkCls}>Jobs</Link>
              <Link href="/company/applications" className={linkCls}>Applications</Link>
              <LogoutButton />
            </>
          )}

          {user?.role === "ADMIN" && (
            <>
              <Link href="/admin/dashboard" className={linkCls}>Dashboard</Link>
              <Link href="/admin/companies" className={linkCls}>Companies</Link>
              <LogoutButton />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

const linkCls = "rounded-lg px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors";
const ctaCls = "rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors";
