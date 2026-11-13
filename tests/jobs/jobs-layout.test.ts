import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const jobsPage = readFileSync(resolve(process.cwd(), "src/features/jobs/components/JobsPage.tsx"), "utf8");
test("jobs filters are opened through a draggable floating control", () => {
  assert.match(jobsPage, /FloatingFilterButton/);
  assert.match(jobsPage, /Drag or click to open filters/);
  assert.match(jobsPage, /onPointerDown/);
  assert.match(jobsPage, /role="dialog"/);
});

test("the jobs page no longer renders a pinned desktop filter sidebar", () => {
  assert.doesNotMatch(jobsPage, /jobs-filter-wrapper|jobs-filter-panel|lg:sticky|lg:fixed/);
  assert.match(jobsPage, /className="fixed inset-y-0 right-0/);
});
