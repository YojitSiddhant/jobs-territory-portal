const buckets = new Map<string, { count: number; resetAt: number }>();

export function assertAiRateLimit(userId: string, feature: string) {
  const now = Date.now();
  const key = `${userId}:${feature}`;
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }
  if (current.count >= 10) {
    const error = new Error("Too many AI requests. Please try again in a minute.");
    Object.assign(error, { status: 429, name: "AI_RATE_LIMITED" });
    throw error;
  }
  current.count += 1;
}
