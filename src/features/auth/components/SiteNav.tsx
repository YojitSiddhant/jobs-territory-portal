import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { LogoutButton } from "./LogoutButton";
import { CandidateNavLinks } from "./CandidateNavLinks";

export async function SiteNav() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors shrink-0">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold select-none">JT</span>
          <span className="text-sm hidden xs:inline sm:inline">Jobs Territory</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 text-sm">
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
              <LogoutButton className={logoutCls} />
            </>
          )}

          {user?.role === "ADMIN" && (
            <>
              <Link href="/admin/dashboard" className={linkCls}>Dashboard</Link>
              <Link href="/admin/companies" className={linkCls}>Companies</Link>
              <LogoutButton className={logoutCls} />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

const linkCls = "rounded-lg px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors font-medium";
const ctaCls = "rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm";
const logoutCls = "rounded-lg px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors text-sm";
