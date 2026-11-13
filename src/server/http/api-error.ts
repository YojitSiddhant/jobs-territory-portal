import { z } from "zod";

export function apiError(error: unknown) {
  if (error instanceof z.ZodError) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: "Request validation failed.", issues: error.issues } },
      { status: 400 },
    );
  }

  if (error instanceof Error && "status" in error) {
    return Response.json(
      { error: { code: error.name.toUpperCase(), message: error.message } },
      { status: Number(error.status) || 500 },
    );
  }

  console.error("Unhandled API error", { type: error instanceof Error ? error.name : "unknown" });
  return Response.json(
    { error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." } },
    { status: 500 },
  );
}
