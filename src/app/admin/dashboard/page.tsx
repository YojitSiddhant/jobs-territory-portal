export const instant = false;

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { AdminOverviewClient } from "@/features/admin/components/AdminOverviewClient";
import type { VerificationCounts } from "@/features/admin/types";

export const metadata: Metadata = { title: "Admin Dashboard – Jobs Territory" };

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  const grouped = await prisma.company.groupBy({ by: ["status"], _count: { _all: true } });
  const counts: VerificationCounts = { PENDING: 0, APPROVED: 0, REJECTED: 0, SUSPENDED: 0 };
  for (const item of grouped) {
    if (item.status in counts) counts[item.status as keyof VerificationCounts] = item._count._all;
  }

  return <AdminOverviewClient initialCounts={counts} />;
}
