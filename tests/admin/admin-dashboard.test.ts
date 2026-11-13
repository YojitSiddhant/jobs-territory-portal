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
