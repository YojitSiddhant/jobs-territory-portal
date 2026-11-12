"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const links = [
  { href: "/jobs", label: "Browse jobs", matches: (path: string) => path === "/jobs" || path.startsWith("/jobs/") },
  { href: "/candidate/applications", label: "Applications", matches: (path: string) => path === "/candidate/applications" || path.startsWith("/candidate/applications/") },
  { href: "/candidate/profile", label: "Profile", matches: (path: string) => path === "/candidate/profile" },
];

export function CandidateNavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => (
        <Link key={link.href} href={link.href} aria-current={link.matches(pathname) ? "page" : undefined} className={link.matches(pathname) ? activeLinkCls : linkCls}>
          {link.label}
        </Link>
      ))}
      <LogoutButton />
    </>
  );
}

const linkCls = "rounded-lg px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors";
const activeLinkCls = "rounded-lg bg-blue-50 px-3 py-1.5 font-medium text-blue-700 transition-colors";
