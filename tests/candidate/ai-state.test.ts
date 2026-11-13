import assert from "node:assert/strict";
import { test } from "node:test";
import { aiRequestReducer, createAiRequestState } from "../../src/features/candidate-ai/state";

test("AI request state clears a previous error when loading starts", () => {
  const state = aiRequestReducer({ value: "old", error: "failed", loading: false }, { type: "start" });
  assert.deepEqual(state, { value: "old", error: null, loading: true });
});

test("AI request success replaces the result and clears the error", () => {
  const state = aiRequestReducer({ value: "old", error: "failed", loading: true }, { type: "success", value: "new" });
  assert.deepEqual(state, { value: "new", error: null, loading: false });
});

test("AI request failure removes the displayed result before showing the error", () => {
  const state = aiRequestReducer({ value: "result", error: null, loading: true }, { type: "failure", message: "failed again" });
  assert.deepEqual(state, { value: null, error: "failed again", loading: false });
});

test("AI request dismiss clears only the error", () => {
  const state = aiRequestReducer({ value: "result", error: "failed", loading: false }, { type: "dismiss" });
  assert.deepEqual(state, { value: "result", error: null, loading: false });
});

test("AI request state starts empty", () => {
  assert.deepEqual(createAiRequestState(), { value: null, error: null, loading: false });
});
