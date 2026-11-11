export const instant = false;

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { applicationSelect, serializeApplication } from "@/server/applications/application-management";
import { ApplicationsPage } from "@/features/candidate-applications/components/ApplicationsPage";
import type { Application } from "@/features/candidate-applications/types";

export const metadata: Metadata = {
  title: "My Applications – Jobs Territory",
};

export default async function CandidateApplicationsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "CANDIDATE") redirect("/");

  const raw = await prisma.application.findMany({
    where: { candidateId: user.id },
    select: applicationSelect,
    orderBy: { createdAt: "desc" },
  });

  const applications: Application[] = raw.map((a) => {
    const serialized = serializeApplication(a);
    return {
      id: serialized.id,
      status: serialized.status as Application["status"],
      coverNote: serialized.coverNote,
      resumeReferenceAvailable: serialized.resumeReferenceAvailable,
      createdAt: (serialized.createdAt instanceof Date
        ? serialized.createdAt
        : new Date(serialized.createdAt as string)
      ).toISOString(),
      updatedAt: (serialized.updatedAt instanceof Date
        ? serialized.updatedAt
        : new Date(serialized.updatedAt as string)
      ).toISOString(),
      job: { ...serialized.job, slug: serialized.job.slug ?? null },
      candidate: serialized.candidate,
      statusHistory: serialized.statusHistory.map((h) => ({
        status: h.status as Application["status"],
        createdAt: (h.createdAt instanceof Date
          ? h.createdAt
          : new Date(h.createdAt as string)
        ).toISOString(),
        actorRole: h.actorRole,
      })),
    };
  });

  return <ApplicationsPage initialApplications={applications} />;
}
