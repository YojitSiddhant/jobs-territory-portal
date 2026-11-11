export const instant = false;

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-white px-6 py-20 text-gray-900">
      <div className="text-center space-y-4">
        <p className="text-xs font-medium uppercase tracking-widest text-emerald-600">Jobs Territory</p>
        <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-gray-500">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="inline-block mt-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors">
          Back to home
        </Link>
      </div>
    </main>
  );
}
