import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { LogoutButton } from "./LogoutButton";

export async function SiteNav() {
  const user = await getSessionUser();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold text-zinc-100 hover:text-white transition-colors">
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
            <>
              <Link href="/jobs" className={linkCls}>Browse jobs</Link>
              <Link href="/candidate/applications" className={linkCls}>Applications</Link>
              <LogoutButton />
            </>
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

const linkCls = "rounded-lg px-3 py-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors";
const ctaCls = "rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors";
