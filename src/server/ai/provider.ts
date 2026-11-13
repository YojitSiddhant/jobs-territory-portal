import { getEnv } from "@/server/config/env";

export type AiProvider = { name: "gemini" | "groq"; generateJson(prompt: string): Promise<unknown> };
export class AiConfigurationError extends Error { status = 503; code = "AI_NOT_CONFIGURED"; constructor(message = "AI features are not configured yet. Add a server-side AI provider key.") { super(message); this.name = "AI_NOT_CONFIGURED"; } }
export class AiProviderError extends Error { status = 502; code = "AI_PROVIDER_ERROR"; constructor(message = "Resume analysis temporarily failed.") { super(message); this.name = "AI_PROVIDER_ERROR"; } }

const timeoutMs = 20_000;
function safeProviderMessage(value: unknown) { return typeof value === "string" ? value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").slice(0, 160) : "Provider request failed."; }
function safeMessageForResponse(status: number, body: unknown) {
  const providerError = body && typeof body === "object" && "error" in body ? (body as { error?: { code?: unknown; message?: unknown } }).error : undefined;
  const errorCode = typeof providerError?.code === "string" ? providerError.code.toLowerCase() : "";
  const errorMessage = typeof providerError?.message === "string" ? providerError.message.toLowerCase() : "";
  if (status === 401 || status === 403) return "Groq API key is invalid.";
  if (status === 404 || errorCode.includes("model") || errorMessage.includes("model") && (errorMessage.includes("not found") || errorMessage.includes("unavailable") || errorMessage.includes("decommission"))) return "Groq model is unavailable. Check GROQ_MODEL and update it to a currently supported model.";
  if (status === 429) return "Groq API quota or rate limit reached.";
  return "Resume analysis temporarily failed.";
}
function logProviderFailure(provider: string, status: number, message: unknown, stage: "request" | "response") { console.warn("AI provider request failed", { provider, status, message: safeProviderMessage(message), stage }); }

async function requestJson(provider: string, url: string, init: RequestInit) {
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { const response = await fetch(url, { ...init, signal: controller.signal }); const body = await response.json().catch(() => null); if (!response.ok) { const safeMessage = safeMessageForResponse(response.status, body); logProviderFailure(provider, response.status, safeMessage, "response"); throw new AiProviderError(safeMessage); } return body; }
  catch (error) { if (error instanceof AiProviderError) throw error; logProviderFailure(provider, 0, error instanceof Error && error.name === "AbortError" ? "Provider request timed out." : "Provider request failed.", "request"); throw new AiProviderError(); }
  finally { clearTimeout(timeout); }
}
function parseJsonText(value: unknown): unknown { if (typeof value !== "string") throw new AiProviderError(); const fenced = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1] ?? value; try { return JSON.parse(fenced); } catch { throw new AiProviderError(); } }

class GeminiProvider implements AiProvider { name = "gemini" as const; #key: string; constructor(key: string) { this.#key = key; } async generateJson(prompt: string) { const body = await requestJson(this.name, `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(this.#key)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }) }); return parseJsonText(body?.candidates?.[0]?.content?.parts?.[0]?.text); } }
class GroqProvider implements AiProvider { name = "groq" as const; #key: string; #model: string; constructor(key: string, model: string) { this.#key = key; this.#model = model; } async generateJson(prompt: string) { const body = await requestJson(this.name, "https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.#key}` }, body: JSON.stringify({ model: this.#model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: "Return only valid JSON matching the requested shape." }, { role: "user", content: prompt }] }) }); return parseJsonText(body?.choices?.[0]?.message?.content); } }

export function getAiProvider(): AiProvider { const env = getEnv(); if (env.AI_PROVIDER === "gemini") { if (!env.GEMINI_API_KEY) throw new AiConfigurationError(); return new GeminiProvider(env.GEMINI_API_KEY); } if (!env.GROQ_API_KEY) throw new AiConfigurationError("Groq API key is missing."); return new GroqProvider(env.GROQ_API_KEY, env.GROQ_MODEL); }
