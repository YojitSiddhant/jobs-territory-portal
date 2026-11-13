import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const jobsPage = readFileSync(resolve(process.cwd(), "src/features/jobs/components/JobsPage.tsx"), "utf8");
const jobFilters = readFileSync(resolve(process.cwd(), "src/features/jobs/components/JobFilters.tsx"), "utf8");
const globalStyles = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

test("jobs filter layout stays in normal document flow", () => {
  for (const source of [jobsPage, jobFilters]) {
    assert.doesNotMatch(source, /\bsticky\b|\bfixed\b|position:\s*(sticky|fixed)|overflow-y-auto|overflow-scroll|overscroll-/);
  }
});

test("jobs filter parent does not create a fixed-height scroll container", () => {
  assert.doesNotMatch(jobsPage, /(?:\bh-screen\b|\bmin-h-screen\b)[^\n]*(?:overflow|scroll)|max-h-\[[^\]]+\][^\n]*(?:overflow|scroll)/);
});

test("jobs filter wrappers defensively force normal document flow", () => {
  assert.match(jobsPage, /jobs-filter-wrapper/);
  assert.match(jobsPage, /jobs-filter-panel/);
  assert.match(globalStyles, /\.jobs-filter-wrapper,[\s\S]*position:\s*static\s*!important/);
  assert.match(globalStyles, /\.jobs-filter-panel[\s\S]*overflow-y:\s*visible\s*!important/);
});
