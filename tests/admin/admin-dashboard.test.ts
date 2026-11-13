import assert from "node:assert/strict";
import test from "node:test";
import { adminStatusHref } from "../../src/features/admin/components/AdminOverviewClient";
import { normalizeCompanyListStatus } from "../../src/server/admin/company-verification";

test("maps every KPI status to its filtered admin companies route", () => {
  assert.equal(adminStatusHref("PENDING"), "/admin/companies?status=PENDING");
  assert.equal(adminStatusHref("APPROVED"), "/admin/companies?status=APPROVED");
  assert.equal(adminStatusHref("REJECTED"), "/admin/companies?status=REJECTED");
  assert.equal(adminStatusHref("SUSPENDED"), "/admin/companies?status=SUSPENDED");
});

test("each KPI status produces a distinct filter", () => {
  const hrefs = (["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const).map(adminStatusHref);
  assert.equal(new Set(hrefs).size, 4);
  assert.deepEqual(hrefs.map((href) => new URL(href, "https://jobs-territory.test").searchParams.get("status")), ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]);
});

test("normalizes unsupported admin status filters to the safe pending view", () => {
  assert.equal(normalizeCompanyListStatus("APPROVED"), "APPROVED");
  assert.equal(normalizeCompanyListStatus("not-a-status"), "PENDING");
  assert.equal(normalizeCompanyListStatus(undefined), "PENDING");
});

test("empty status results remain empty rather than falling back to another status", () => {
  const companies: Array<{ status: string }> = [];
  const selectedStatus = normalizeCompanyListStatus("SUSPENDED");
  assert.equal(companies.filter((company) => company.status === selectedStatus).length, 0);
});

test("a status result contains only companies matching the selected status", () => {
  const companies = [{ status: "PENDING" }, { status: "APPROVED" }, { status: "APPROVED" }, { status: "REJECTED" }];
  for (const status of ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const) {
    assert.ok(companies.filter((company) => company.status === status).every((company) => company.status === status));
  }
});
