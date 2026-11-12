"use client";

import { useState, useTransition } from "react";

type Action = "approve" | "reject" | "suspend" | "restore" | "verify-item" | "reject-item";

const config: Record<Action, { title: string; desc: string; needsReason: boolean; btnCls: string; btnLabel: string }> = {
  approve: { title: "Approve company", desc: "This will approve the company and allow it to post jobs.", needsReason: false, btnCls: "bg-blue-600 hover:bg-blue-500 text-white", btnLabel: "Approve" },
  reject: { title: "Reject company", desc: "The company will be notified of the rejection. A reason is required.", needsReason: true, btnCls: "bg-red-600 hover:bg-red-500 text-white", btnLabel: "Reject" },
  suspend: { title: "Suspend company", desc: "The company's jobs will be hidden and cannot post new ones. A reason is required.", needsReason: true, btnCls: "bg-orange-600 hover:bg-orange-500 text-white", btnLabel: "Suspend" },
  restore: { title: "Restore company", desc: "This will restore the company from suspension to approved status.", needsReason: false, btnCls: "bg-blue-600 hover:bg-blue-500 text-white", btnLabel: "Restore" },
  "verify-item": { title: "Verify item", desc: "Confirm that this company information or document is valid.", needsReason: false, btnCls: "bg-blue-600 hover:bg-blue-500 text-white", btnLabel: "Verify" },
  "reject-item": { title: "Reject item", desc: "Explain what must be corrected before review can continue.", needsReason: true, btnCls: "bg-red-600 hover:bg-red-500 text-white", btnLabel: "Reject item" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" role="dialog" aria-modal aria-labelledby="dialog-title">
      <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 p-6 shadow-2xl space-y-4">
        <h2 id="dialog-title" className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{desc}</p>
        {needsReason && (
          <div>
            <label htmlFor="review-reason" className="block text-xs font-medium text-gray-500 mb-1.5">Reason <span className="text-gray-400">*</span></label>
            <textarea id="review-reason" rows={3} maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter a reason…" className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none transition-colors" />
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-3 pt-1">
          <button type="button" onClick={handleConfirm} disabled={isPending} className={`rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60 transition-colors ${btnCls}`}>
            {isPending ? "Working…" : btnLabel}
          </button>
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}
