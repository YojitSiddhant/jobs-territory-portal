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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div>
          <Link href="/" className="text-xs font-medium uppercase tracking-widest text-emerald-600 hover:text-emerald-500 transition-colors">
            Jobs Territory
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-5 shadow-sm">
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm text-gray-500">
            {footer.text}{" "}
            <Link href={footer.href} className="text-emerald-600 hover:text-emerald-500 transition-colors font-medium">
              {footer.linkText}
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
