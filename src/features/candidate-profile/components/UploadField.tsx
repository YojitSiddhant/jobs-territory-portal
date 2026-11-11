"use client";

type Props = {
  label: string;
  fileKey: string | null;
  kind: "profile-photo" | "resume";
  onClear: () => void;
  onUpload: (file: File) => Promise<void>;
};

export function UploadField({ label, fileKey, onClear, onUpload }: Props) {
  const hasFile = Boolean(fileKey);

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
      <p className="text-sm font-medium text-zinc-300 mb-3">{label}</p>

      {hasFile ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-emerald-400">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.5 5.5L6 13L2.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-xs text-zinc-400 truncate font-mono">{fileKey}</span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-500 cursor-pointer">
              <input type="file" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) void onUpload(file); e.currentTarget.value = ""; }} />
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v9M4 6l4-4 4 4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Choose file
            </label>
            <span className="text-xs text-zinc-500">No file selected</span>
          </div>
          <p className="text-xs text-zinc-500">Files are stored privately and are available only to authorized users.</p>
        </div>
      )}
    </div>
  );
}
