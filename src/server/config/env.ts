import { z } from "zod";

export const defaultGroqModel = "openai/gpt-oss-20b";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(32),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
  STORAGE_DRIVER: z.enum(["s3", "local"]).default(process.env.NODE_ENV === "production" ? "s3" : "local"),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_REGION: z.string().optional(),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_ACCESS_KEY_ID: z.string().optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional(),
  STORAGE_LOCAL_DIR: z.string().default(".private-storage"),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, z.string().default(defaultGroqModel)),
  AI_PROVIDER: z.enum(["gemini", "groq"]).default("gemini"),
});

export function getEnv() {
  return envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    APP_URL: process.env.APP_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    SESSION_TTL_DAYS: process.env.SESSION_TTL_DAYS,
    STORAGE_DRIVER: process.env.STORAGE_DRIVER,
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
    STORAGE_REGION: process.env.STORAGE_REGION,
    STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT,
    STORAGE_ACCESS_KEY_ID: process.env.STORAGE_ACCESS_KEY_ID,
    STORAGE_SECRET_ACCESS_KEY: process.env.STORAGE_SECRET_ACCESS_KEY,
    STORAGE_LOCAL_DIR: process.env.STORAGE_LOCAL_DIR,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GROQ_MODEL: process.env.GROQ_MODEL,
    AI_PROVIDER: process.env.AI_PROVIDER,
  });
}
