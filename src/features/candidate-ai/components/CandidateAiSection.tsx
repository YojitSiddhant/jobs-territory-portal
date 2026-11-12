"use client";

import { useState } from "react";
import { analyzeResume, fetchRecommendations, type Recommendation, type ResumeAnalysis } from "../api";

export function CandidateAiSection() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState<"analysis" | "recommendations" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() { setLoading("analysis"); setError(null); try { setAnalysis(await analyzeResume()); } catch (err) { setError(err instanceof Error ? err.message : "Could not analyze your resume."); } finally { setLoading(null); } }
  async function loadRecommendations() { setLoading("recommendations"); setError(null); try { setRecommendations(await fetchRecommendations()); } catch (err) { setError(err instanceof Error ? err.message : "Could not load recommendations."); } finally { setLoading(null); } }

  return <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6 space-y-5 shadow-sm">
    <div><p className="text-xs font-medium uppercase tracking-widest text-blue-600">AI career tools</p><h2 className="mt-1 text-base font-semibold text-gray-900">Improve your job search</h2><p className="mt-1 text-sm text-gray-500">AI uses your profile and private resume on the server. Results are informational, not hiring decisions.</p></div>
    <div className="flex flex-wrap gap-2"><button type="button" onClick={runAnalysis} disabled={Boolean(loading)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{loading === "analysis" ? "Analyzing…" : "Analyze my resume"}</button><button type="button" onClick={loadRecommendations} disabled={Boolean(loading)} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 disabled:opacity-50">{loading === "recommendations" ? "Finding matches…" : "Recommend jobs"}</button></div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}<button type="button" onClick={() => setError(null)} className="ml-2 underline">Dismiss</button></div>}
    {analysis && <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4"><h3 className="text-sm font-semibold text-gray-900">Resume analysis</h3><p className="text-sm text-gray-700">{analysis.summary}</p><AiList label="Skills" items={analysis.skills} /><AiList label="Strengths" items={analysis.strengths} /><AiList label="Suggestions" items={analysis.suggestions} /><AiList label="Missing information" items={analysis.missingInformation} /></div>}
    {recommendations && <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4"><h3 className="text-sm font-semibold text-gray-900">Recommended jobs</h3>{recommendations.length === 0 ? <p className="text-sm text-gray-500">No strong matches are available yet.</p> : recommendations.map((item) => <div key={item.jobId} className="border-t border-gray-100 pt-3 first:border-0 first:pt-0"><div className="flex justify-between gap-3"><p className="text-sm font-medium text-gray-900">{item.job?.title ?? "Job"}</p><span className="text-sm font-semibold text-blue-600">{item.matchPercentage}% match</span></div><p className="text-xs text-gray-500">{item.job?.company}{item.job?.location ? ` · ${item.job.location}` : ""}</p><p className="mt-1 text-xs text-gray-600">{item.reasons.join(" ")}</p></div>)}</div>}
  </section>;
}

function AiList({ label, items }: { label: string; items: string[] }) { return <div><h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</h4>{items.length ? <ul className="mt-1 list-disc pl-4 text-sm text-gray-700">{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-1 text-sm text-gray-400">None identified.</p>}</div>; }
