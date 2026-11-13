"use client";

import { useReducer } from "react";
import { analyzeResume, type ResumeAnalysis } from "../api";
import { aiRequestReducer, createAiRequestState } from "../state";

export function CandidateAiSection() {
  const [analysisState, dispatchAnalysis] = useReducer(aiRequestReducer<ResumeAnalysis>, undefined, createAiRequestState);
  const loading = analysisState.loading;

  async function runAnalysis() { dispatchAnalysis({ type: "start" }); try { dispatchAnalysis({ type: "success", value: await analyzeResume() }); } catch (err) { dispatchAnalysis({ type: "failure", message: err instanceof Error ? err.message : "Could not analyze your resume." }); } }

  return <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6 space-y-5 shadow-sm">
    <div><p className="text-xs font-medium uppercase tracking-widest text-blue-600">AI career tools</p><h2 className="mt-1 text-base font-semibold text-gray-900">Improve your job search</h2><p className="mt-1 text-sm text-gray-500">AI uses your profile and private resume on the server. Results are informational, not hiring decisions.</p></div>
    <div className="flex flex-wrap gap-2"><button type="button" onClick={runAnalysis} disabled={loading} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{loading ? "Analyzing…" : "Analyze my resume"}</button></div>
    {analysisState.error && <AiError message={analysisState.error} onDismiss={() => dispatchAnalysis({ type: "dismiss" })} />}
    {analysisState.value && <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4"><h3 className="text-sm font-semibold text-gray-900">Resume analysis</h3><p className="text-sm text-gray-700">{analysisState.value.summary}</p><AiList label="Skills" items={analysisState.value.skills} /><AiList label="Strengths" items={analysisState.value.strengths} /><AiList label="Suggestions" items={analysisState.value.suggestions} /><AiList label="Missing information" items={analysisState.value.missingInformation} /></div>}
  </section>;
}

function AiList({ label, items }: { label: string; items: string[] }) { return <div><h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</h4>{items.length ? <ul className="mt-1 list-disc pl-4 text-sm text-gray-700">{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-1 text-sm text-gray-400">None identified.</p>}</div>; }
function AiError({ message, onDismiss }: { message: string; onDismiss: () => void }) { return <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{message}<button type="button" onClick={onDismiss} className="ml-2 underline">Dismiss</button></div>; }
