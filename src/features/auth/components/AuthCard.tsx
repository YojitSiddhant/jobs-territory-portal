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
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div>
          <Link href="/" className="text-xs font-medium uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">
            Jobs Territory
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
        </div>

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm text-zinc-500">
            {footer.text}{" "}
            <Link href={footer.href} className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              {footer.linkText}
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
