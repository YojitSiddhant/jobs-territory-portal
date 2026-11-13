import test from "node:test";
import assert from "node:assert/strict";
import { getAiProvider, AiConfigurationError, AiProviderError } from "../../src/server/ai/provider";
import { coverLetterSchema, matchSchema, recommendationsSchema, resumeAnalysisSchema } from "../../src/server/ai/schemas";
import { assertAiRateLimit } from "../../src/server/ai/rate-limit";

const originalEnv = { ...process.env };

function setAiEnv(values: Record<string, string | undefined>) {
  process.env.DATABASE_URL = "mysql://test";
  process.env.AUTH_SECRET = "12345678901234567890123456789012";
  process.env.AI_PROVIDER = values.AI_PROVIDER ?? "gemini";
  if (values.GEMINI_API_KEY === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = values.GEMINI_API_KEY;
  if (values.GROQ_API_KEY === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = values.GROQ_API_KEY;
  if (values.GROQ_MODEL === undefined) delete process.env.GROQ_MODEL; else process.env.GROQ_MODEL = values.GROQ_MODEL;
}

test.after(() => {
  for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
  Object.assign(process.env, originalEnv);
});

test("AI provider selection returns a clear missing-key configuration error", () => {
  setAiEnv({ AI_PROVIDER: "gemini" });
  assert.throws(() => getAiProvider(), (error) => error instanceof AiConfigurationError && error.status === 503);
});

test("AI provider selection supports Gemini and Groq without exposing keys", () => {
  setAiEnv({ AI_PROVIDER: "gemini", GEMINI_API_KEY: "gemini-secret" });
  assert.equal(getAiProvider().name, "gemini");
  setAiEnv({ AI_PROVIDER: "groq", GROQ_API_KEY: "groq-secret" });
  const provider = getAiProvider();
  assert.equal(provider.name, "groq");
  assert.equal(JSON.stringify(provider).includes("groq-secret"), false);
});

test("Groq missing key has a safe message", () => {
  setAiEnv({ AI_PROVIDER: "groq" });
  assert.throws(() => getAiProvider(), (error) => error instanceof AiConfigurationError && error.message === "Groq API key is missing.");
});

test("Groq normalizes a successful OpenAI-compatible response", async () => {
  setAiEnv({ AI_PROVIDER: "groq", GROQ_API_KEY: "secret" });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    assert.equal(input, "https://api.groq.com/openai/v1/chat/completions");
    assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer secret");
    const body = JSON.parse(String(init?.body));
    assert.equal(body.model, "llama-3.3-70b-versatile");
    return new Response(JSON.stringify({ choices: [{ message: { content: "{\"ok\":true}" } }] }), { status: 200 });
  };
  try { assert.deepEqual(await getAiProvider().generateJson("prompt"), { ok: true }); } finally { globalThis.fetch = originalFetch; }
});

test("Groq uses a configured model override", async () => {
  setAiEnv({ AI_PROVIDER: "groq", GROQ_API_KEY: "secret", GROQ_MODEL: "llama-3.1-8b-instant" });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    assert.equal(JSON.parse(String(init?.body)).model, "llama-3.1-8b-instant");
    return new Response(JSON.stringify({ choices: [{ message: { content: "{\"ok\":true}" } }] }), { status: 200 });
  };
  try { await getAiProvider().generateJson("prompt"); } finally { globalThis.fetch = originalFetch; }
});

for (const [name, status, message] of [["invalid key", 401, "Groq API key is invalid."], ["rate limit", 429, "Groq API quota or rate limit reached."], ["model unavailable", 404, "Groq model is unavailable. Check GROQ_MODEL and update it to a currently supported model."]] as const) {
  test(`Groq ${name} response is safe`, async () => {
    setAiEnv({ AI_PROVIDER: "groq", GROQ_API_KEY: "secret" });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: "secret resume data" } }), { status });
    try { await assert.rejects(() => getAiProvider().generateJson("prompt"), (error) => error instanceof AiProviderError && error.message === message && !error.message.includes("secret")); } finally { globalThis.fetch = originalFetch; }
  });
}

test("Groq timeout returns a safe normalized error", async () => {
  setAiEnv({ AI_PROVIDER: "groq", GROQ_API_KEY: "secret" });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw Object.assign(new Error("secret"), { name: "AbortError" }); };
  try { await assert.rejects(() => getAiProvider().generateJson("prompt"), (error) => error instanceof AiProviderError && error.message === "Resume analysis temporarily failed."); } finally { globalThis.fetch = originalFetch; }
});

test("AI response schemas reject malformed provider output", () => {
  assert.equal(resumeAnalysisSchema.safeParse({ summary: "only" }).success, false);
  assert.equal(recommendationsSchema.safeParse([{ jobId: "job", matchPercentage: 101, reasons: [], matchingSkills: [], missingSkills: [] }]).success, false);
  assert.equal(matchSchema.safeParse({ score: 20, matchedSkills: [], missingSkills: [], explanation: "ok" }).success, true);
  assert.equal(coverLetterSchema.safeParse({ coverLetter: "too short" }).success, false);
});

test("AI rate limits repeated requests per user and feature", () => {
  const userId = `rate-test-${Date.now()}`;
  for (let i = 0; i < 10; i++) assert.doesNotThrow(() => assertAiRateLimit(userId, "test"));
  assert.throws(() => assertAiRateLimit(userId, "test"), /Too many AI requests/);
});
