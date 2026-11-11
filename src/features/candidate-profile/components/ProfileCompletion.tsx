"use client";

type Props = { percentage: number };

export function ProfileCompletion({ percentage }: Props) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Profile completion</span>
        <span className="text-sm font-semibold text-emerald-600">{percentage}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage < 100 && (
        <p className="mt-2 text-xs text-gray-400">
          Complete all sections to improve your visibility to employers.
        </p>
      )}
    </div>
  );
}
