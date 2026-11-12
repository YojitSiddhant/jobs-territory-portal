import { getEnv } from "@/server/config/env";

export type AiProvider = {
  name: "gemini" | "grok";
  generateJson(prompt: string): Promise<unknown>;
};

export class AiConfigurationError extends Error {
  status = 503;
  code = "AI_NOT_CONFIGURED";
  constructor(message = "AI features are not configured yet. Add a server-side AI provider key.") {
    super(message);
    this.name = "AI_NOT_CONFIGURED";
  }
}

export class AiProviderError extends Error {
  status = 502;
  code = "AI_PROVIDER_ERROR";
  constructor(message = "The AI provider could not complete this request.") {
    super(message);
    this.name = "AI_PROVIDER_ERROR";
  }
}

const timeoutMs = 20_000;

async function requestJson(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new AiProviderError();
    return body;
  } catch (error) {
    if (error instanceof AiProviderError) throw error;
    throw new AiProviderError(error instanceof Error && error.name === "AbortError" ? "The AI provider request timed out." : undefined);
  } finally {
    clearTimeout(timeout);
  }
}

function parseJsonText(value: unknown): unknown {
  if (typeof value !== "string") throw new AiProviderError("The AI provider returned an invalid response.");
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1] ?? value;
  try { return JSON.parse(fenced); } catch { throw new AiProviderError("The AI provider returned malformed JSON."); }
}

class GeminiProvider implements AiProvider {
  name = "gemini" as const;
  constructor(private readonly key: string) {}
  async generateJson(prompt: string) {
    const body = await requestJson(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(this.key)}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }),
    });
    return parseJsonText(body?.candidates?.[0]?.content?.parts?.[0]?.text);
  }
}

class GrokProvider implements AiProvider {
  name = "grok" as const;
  constructor(private readonly key: string) {}
  async generateJson(prompt: string) {
    const body = await requestJson("https://api.x.ai/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.key}` },
      body: JSON.stringify({ model: "grok-3-mini", temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: "Return only valid JSON matching the requested shape." }, { role: "user", content: prompt }] }),
    });
    return parseJsonText(body?.choices?.[0]?.message?.content);
  }
}

export function getAiProvider(): AiProvider {
  const env = getEnv();
  if (env.AI_PROVIDER === "gemini") {
    if (!env.GEMINI_API_KEY) throw new AiConfigurationError();
    return new GeminiProvider(env.GEMINI_API_KEY);
  }
  if (!env.GROK_API_KEY) throw new AiConfigurationError();
  return new GrokProvider(env.GROK_API_KEY);
}
