"use client";

import { useState, useTransition } from "react";
import type { CompanyDocument, CompanyProfile } from "../types";
import { registerDocument, uploadCompanyDocument } from "../api";

const documentTypeLabels: Record<string, string> = {
  REGISTRATION_CERTIFICATE: "Registration certificate",
  TAX_DOCUMENT: "Tax document",
  IDENTITY_DOCUMENT: "Identity document",
  OTHER: "Other",
};

const documentStatusConfig: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "text-yellow-600 border-yellow-200 bg-yellow-50" },
  APPROVED: { label: "Approved", cls: "text-emerald-600 border-emerald-200 bg-emerald-50" },
  REJECTED: { label: "Rejected", cls: "text-red-600 border-red-200 bg-red-50" },
};

type Props = {
  companyId: string;
  documents: CompanyDocument[];
  canEdit: boolean;
  onDocumentAdded: (profile: CompanyProfile) => void;
};

export function DocumentsSection({ companyId, documents, canEdit }: Omit<Props, "onDocumentAdded"> & { onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "REGISTRATION_CERTIFICATE", storageKey: "", originalName: "", mimeType: "application/pdf" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);

  const prefix = `private/companies/${companyId}/company-document/`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file && !form.storageKey.startsWith(prefix)) {
      setError(`Storage key must start with: ${prefix}`);
      return;
    }
    startTransition(async () => {
      try {
        if (file) await uploadCompanyDocument(form.type, file); else await registerDocument(form);
        setSuccess(file ? "Document uploaded privately. Reload to see the updated list." : "Document reference registered. Reload to see the updated list.");
        setShowForm(false);
        setForm({ type: "REGISTRATION_CERTIFICATE", storageKey: "", originalName: "", mimeType: "application/pdf" }); setFile(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to register document.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Verification documents</h3>
        {canEdit && !showForm && (
          <button type="button" onClick={() => setShowForm(true)} className="text-xs text-emerald-600 hover:text-emerald-500 transition-colors">
            + Register document reference
          </button>
        )}
      </div>

      {/* Storage not configured notice */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
        Upload files directly for private storage, or register an existing private reference.
      </div>

      {documents.length > 0 ? (
        <ul className="space-y-2">
          {documents.map((doc) => {
            const sc = documentStatusConfig[doc.status] ?? { label: doc.status, cls: "text-gray-500 border-gray-200" };
            return (
              <li key={doc.id} className="flex items-start justify-between gap-3 rounded-xl bg-white border border-gray-200 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.originalName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{documentTypeLabels[doc.type] ?? doc.type} · {doc.mimeType}</p>
                  {doc.rejectionReason && <p className="text-xs text-red-600 mt-1">Rejected: {doc.rejectionReason}</p>}
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${sc.cls}`}>{sc.label}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">No documents registered yet.</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-700">Register document reference</p>
          <div>
            <label htmlFor="doc-file" className="block text-xs text-gray-500 mb-1">Private file upload</label>
            <input id="doc-file" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-xs text-gray-500" />
          </div>
          <div className="text-center text-xs text-gray-400">or register an existing reference</div>
          <div>
            <label htmlFor="doc-type" className="block text-xs text-gray-500 mb-1">Document type</label>
            <select id="doc-type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none">
              {Object.entries(documentTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="doc-key" className="block text-xs text-gray-500 mb-1">Storage key</label>
            <input id="doc-key" type="text" value={form.storageKey} onChange={(e) => setForm((f) => ({ ...f, storageKey: e.target.value }))} required placeholder={`${prefix}...`} className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="doc-name" className="block text-xs text-gray-500 mb-1">File name</label>
              <input id="doc-name" type="text" value={form.originalName} onChange={(e) => setForm((f) => ({ ...f, originalName: e.target.value }))} required maxLength={255} placeholder="document.pdf" className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="doc-mime" className="block text-xs text-gray-500 mb-1">MIME type</label>
              <input id="doc-mime" type="text" value={form.mimeType} onChange={(e) => setForm((f) => ({ ...f, mimeType: e.target.value }))} required maxLength={120} placeholder="application/pdf" className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-emerald-600">{success}</p>}
          <div className="flex items-center gap-2">
            <button type="submit" disabled={isPending} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors">
              {isPending ? "Registering…" : "Register"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(null); }} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
