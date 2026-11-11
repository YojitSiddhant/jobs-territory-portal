"use client";

import { useState, useTransition } from "react";

type Action = "approve" | "reject" | "suspend" | "restore";

const config: Record<Action, { title: string; desc: string; needsReason: boolean; btnCls: string; btnLabel: string }> = {
  approve: { title: "Approve company", desc: "This will approve the company and allow it to post jobs.", needsReason: false, btnCls: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950", btnLabel: "Approve" },
  reject: { title: "Reject company", desc: "The company will be notified of the rejection. A reason is required.", needsReason: true, btnCls: "bg-red-600 hover:bg-red-500 text-zinc-100", btnLabel: "Reject" },
  suspend: { title: "Suspend company", desc: "The company's jobs will be hidden and cannot post new ones. A reason is required.", needsReason: true, btnCls: "bg-orange-600 hover:bg-orange-500 text-zinc-100", btnLabel: "Suspend" },
  restore: { title: "Restore company", desc: "This will restore the company from suspension to approved status.", needsReason: false, btnCls: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950", btnLabel: "Restore" },
};

type Props = {
  action: Action;
  onConfirm: (reason?: string) => Promise<void>;
  onClose: () => void;
};

export function ReviewDialog({ action, onConfirm, onClose }: Props) {
  const { title, desc, needsReason, btnCls, btnLabel } = config[action];
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (needsReason && !reason.trim()) { setError("A reason is required."); return; }
    setError(null);
    startTransition(async () => {
      try {
        await onConfirm(needsReason ? reason.trim() : undefined);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm px-4" role="dialog" aria-modal aria-labelledby="dialog-title">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl space-y-4">
        <h2 id="dialog-title" className="text-base font-semibold text-zinc-100">{title}</h2>
        <p className="text-sm text-zinc-400">{desc}</p>
        {needsReason && (
          <div>
            <label htmlFor="review-reason" className="block text-xs font-medium text-zinc-400 mb-1.5">Reason <span className="text-zinc-600">*</span></label>
            <textarea id="review-reason" rows={3} maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter a reason…" className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none resize-none transition-colors" />
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex items-center gap-3 pt-1">
          <button type="button" onClick={handleConfirm} disabled={isPending} className={`rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60 transition-colors ${btnCls}`}>
            {isPending ? "Working…" : btnLabel}
          </button>
          <button type="button" onClick={onClose} className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}
