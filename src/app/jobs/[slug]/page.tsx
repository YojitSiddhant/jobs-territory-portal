export const instant = false;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { getPublicJob, serializePublicJob } from "@/server/jobs/public-discovery";
import { JobDetailClient } from "@/features/jobs/components/JobDetailClient";
import type { PublicJob } from "@/features/jobs/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublicJob(slug);
  if (!job) return { title: "Job not found – Jobs Territory" };
  return {
    title: `${job.title} at ${job.company.name} – Jobs Territory`,
    description: job.description.slice(0, 160),
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [job, user] = await Promise.all([getPublicJob(slug), getSessionUser()]);

  if (!job) notFound();

  let hasApplied = false;
  if (user?.role === "CANDIDATE") {
    const application = await prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: job.id, candidateId: user.id } },
      select: { id: true },
    });
    hasApplied = Boolean(application);
  }

  const raw = serializePublicJob(job);
  const clientJob: PublicJob = {
    ...raw,
    slug: raw.slug ?? null,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : (raw.createdAt as string),
    updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : (raw.updatedAt as string),
    publishedAt: raw.publishedAt instanceof Date ? raw.publishedAt.toISOString() : (raw.publishedAt as string | null),
    applicationDeadline: raw.applicationDeadline instanceof Date ? raw.applicationDeadline.toISOString() : (raw.applicationDeadline as string | null),
    workplaceType: raw.workplaceType as PublicJob["workplaceType"],
    requiredSkills: raw.requiredSkills as string[],
    salaryMin: raw.salaryMin !== null ? Number(raw.salaryMin) : null,
    salaryMax: raw.salaryMax !== null ? Number(raw.salaryMax) : null,
  };

  return (
    <JobDetailClient
      job={clientJob}
      hasApplied={hasApplied}
      isCandidate={user?.role === "CANDIDATE"}
    />
  );
}
