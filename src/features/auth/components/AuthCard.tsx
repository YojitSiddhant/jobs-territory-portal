import type { ReactNode } from "react";
import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: { text: string; linkText: string; href: string };
};

export function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-blue-50 via-white to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-blue-600 hover:text-blue-500 transition-colors">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white text-[9px] font-bold">JT</span>
            Jobs Territory
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>}
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-5 shadow-sm shadow-gray-100">
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm text-gray-500">
            {footer.text}{" "}
            <Link href={footer.href} className="text-blue-600 hover:text-blue-500 transition-colors font-semibold">
              {footer.linkText}
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
