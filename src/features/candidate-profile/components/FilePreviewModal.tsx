"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

type Props = { kind: "profile-photo" | "resume"; previewUrl: string; onClose: () => void };

export function FilePreviewModal({ kind, previewUrl, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="file-preview-title">
      <div className="relative max-h-[90vh] w-full max-w-3xl rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 id="file-preview-title" className="text-base font-semibold text-gray-900">{kind === "profile-photo" ? "Profile photo preview" : "Resume preview"}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close preview" className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Close</button>
        </div>
        {kind === "profile-photo" ? <div className="flex max-h-[75vh] justify-center overflow-auto rounded-lg bg-gray-50 p-2"><Image src={previewUrl} alt="Profile photo" width={800} height={800} className="max-h-[70vh] w-auto max-w-full object-contain" unoptimized /></div> : <><iframe title="Resume document preview" src={previewUrl} className="h-[70vh] w-full rounded-lg border border-gray-200" /><a href={`${previewUrl}?download=1`} download className="mt-3 inline-flex rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white">Download</a></>}
      </div>
    </div>
  );
}
