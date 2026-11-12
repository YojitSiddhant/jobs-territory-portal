"use client";

import { useState, useTransition } from "react";
import type { CompanyDocument, DocumentType } from "../types";
import { removeCompanyDocument, uploadCompanyDocument } from "../api";

const labels: Record<DocumentType, string> = { REGISTRATION_CERTIFICATE: "Registration certificate", TAX_DOCUMENT: "Tax document", IDENTITY_DOCUMENT: "Identity document", ADDRESS_PROOF: "Address proof", OTHER: "Other document" };
const statuses: Record<string, string> = { PENDING: "Pending", VERIFIED: "Verified", REJECTED: "Rejected" };
const previewUrl = (id: string) => `/api/company/profile/documents/${encodeURIComponent(id)}/preview`;

type Props = { documents: CompanyDocument[]; canEdit: boolean; onRefresh: () => void };

export function DocumentsSection({ documents, canEdit, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<DocumentType>("REGISTRATION_CERTIFICATE");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [removing, setRemoving] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function upload(event: React.FormEvent) {
    event.preventDefault(); setMessage(null); setError(null);
    if (!file) { setError("Choose a document to upload."); return; }
    if (!["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) { setError("Only PDF, DOC, and DOCX files are supported."); return; }
    if (file.size <= 0 || file.size > 10 * 1024 * 1024) { setError("The document must be smaller than 10 MB."); return; }
    startTransition(async () => { try { setProgress(25); await uploadCompanyDocument(type, file); setProgress(100); setMessage("Document uploaded successfully."); setFile(null); setShowForm(false); onRefresh(); } catch (err) { setError(err instanceof Error ? err.message : "Upload failed."); } });
  }

  function remove(id: string) { setRemoving(id); setError(null); startTransition(async () => { try { await removeCompanyDocument(id); setMessage("Document removed successfully."); onRefresh(); } catch (err) { setError(err instanceof Error ? err.message : "Could not remove document."); } finally { setRemoving(null); } }); }

  return <div className="space-y-4">
    <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-900">Verification documents</h3>{canEdit && !showForm && <button type="button" onClick={() => setShowForm(true)} className="text-xs text-blue-600 hover:text-blue-500">+ Upload document</button>}</div>
    {documents.length ? <ul className="space-y-2">{documents.map((doc) => <li key={doc.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-gray-900">{doc.originalName}</p><p className="mt-0.5 text-xs text-gray-500">{labels[doc.type]} · {statuses[doc.status] ?? "Pending"}</p>{doc.rejectionReason && <p className="mt-1 text-xs text-red-600">Rejected: {doc.rejectionReason}</p>}<div className="mt-2 flex gap-3"><a href={previewUrl(doc.id)} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-700 hover:underline">Preview</a>{canEdit && <button type="button" onClick={() => remove(doc.id)} disabled={removing === doc.id} className="text-xs font-medium text-red-600">{removing === doc.id ? "Removing…" : "Remove"}</button>}</div></div></li>)}</ul> : <p className="text-sm text-gray-400">No documents uploaded yet.</p>}
    {showForm && <form onSubmit={upload} className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4"><p className="text-xs font-semibold text-gray-700">Upload verification document</p><div><label htmlFor="doc-type" className="mb-1 block text-xs text-gray-500">Document type</label><select id="doc-type" value={type} onChange={(e) => setType(e.target.value as DocumentType)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900">{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div><label htmlFor="doc-file" className="mb-1 block text-xs text-gray-500">File</label><input id="doc-file" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-xs text-gray-500" /></div>{isPending && <p className="text-xs text-blue-600">Uploading {progress}%…</p>}{error && <p className="text-xs text-red-600">{error}</p>}<div className="flex gap-2"><button type="submit" disabled={isPending} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">{isPending ? "Uploading…" : "Upload"}</button><button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-500">Cancel</button></div></form>}
    {message && <p className="text-xs text-blue-600">{message}</p>}
  </div>;
}
