import test from "node:test";
import assert from "node:assert/strict";
import { getAiProvider, AiConfigurationError } from "../../src/server/ai/provider";
import { coverLetterSchema, matchSchema, recommendationsSchema, resumeAnalysisSchema } from "../../src/server/ai/schemas";
import { assertAiRateLimit } from "../../src/server/ai/rate-limit";

const originalEnv = { ...process.env };

function setAiEnv(values: Record<string, string | undefined>) {
  process.env.DATABASE_URL = "mysql://test";
  process.env.AUTH_SECRET = "12345678901234567890123456789012";
  process.env.AI_PROVIDER = values.AI_PROVIDER ?? "gemini";
  if (values.GEMINI_API_KEY === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = values.GEMINI_API_KEY;
  if (values.GROK_API_KEY === undefined) delete process.env.GROK_API_KEY; else process.env.GROK_API_KEY = values.GROK_API_KEY;
}

test.after(() => {
  for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
  Object.assign(process.env, originalEnv);
});

test("AI provider selection returns a clear missing-key configuration error", () => {
  setAiEnv({ AI_PROVIDER: "gemini" });
  assert.throws(() => getAiProvider(), (error) => error instanceof AiConfigurationError && error.status === 503);
});

test("AI provider selection supports Gemini and Grok without exposing keys", () => {
  setAiEnv({ AI_PROVIDER: "gemini", GEMINI_API_KEY: "gemini-secret" });
  assert.equal(getAiProvider().name, "gemini");
  setAiEnv({ AI_PROVIDER: "grok", GROK_API_KEY: "grok-secret" });
  assert.equal(getAiProvider().name, "grok");
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
