export const instant = false;

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-950 px-6 py-20 text-zinc-100">
      <div className="text-center space-y-4">
        <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">Jobs Territory</p>
        <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-zinc-400">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="inline-block mt-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors">
          Back to home
        </Link>
      </div>
    </main>
  );
}
