export const instant = false;

import { connection } from "next/server";
import type { Metadata } from "next";
import { normalizeDiscoveryQuery } from "@/shared/validation/job-discovery";
import { prisma } from "@/server/db/prisma";
import { publicJobSelect, serializePublicJob } from "@/server/jobs/public-discovery";
import { JobsPage } from "@/features/jobs/components/JobsPage";
import type { Prisma } from "@prisma/client";
import type { PublicJob } from "@/features/jobs/types";

export const metadata: Metadata = {
  title: "Browse Jobs – Jobs Territory",
  description: "Discover open roles from verified companies.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function flattenSearchParams(raw: Record<string, string | string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string") out[k] = v;
    else if (Array.isArray(v) && v.length > 0) out[k] = v[0]!;
  }
  return out;
}

export default async function BrowseJobsPage({ searchParams }: PageProps) {
  await connection();
  const raw = await searchParams;
  const params = new URLSearchParams(flattenSearchParams(raw));
  const query = normalizeDiscoveryQuery(params);
  const now = new Date();

  const andFilters: Prisma.JobWhereInput[] = [
    { OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: now } }] },
  ];
  if (query.q)
    andFilters.push({
      OR: [
        { title: { contains: query.q } },
        { description: { contains: query.q } },
        { company: { name: { contains: query.q } } },
        { requiredSkills: { string_contains: query.q } },
      ],
    });
  if (query.company)
    andFilters.push({
      company: { is: { OR: [{ id: query.company }, { name: { contains: query.company } }] } },
    });
  if (query.salaryMin !== undefined)
    andFilters.push({ OR: [{ salaryMax: null }, { salaryMax: { gte: query.salaryMin } }] });
  if (query.salaryMax !== undefined)
    andFilters.push({ OR: [{ salaryMin: null }, { salaryMin: { lte: query.salaryMax } }] });

  const where: Prisma.JobWhereInput = {
    status: "PUBLISHED",
    company: { status: "APPROVED" },
    AND: andFilters,
    ...(query.location ? { location: { contains: query.location } } : {}),
    ...(query.workplaceType ? { workplaceType: query.workplaceType } : {}),
    ...(query.employmentType ? { employmentType: query.employmentType } : {}),
    ...(query.experience ? { experienceRequirement: { contains: query.experience } } : {}),
    ...(query.skill ? { requiredSkills: { string_contains: query.skill } } : {}),
  };

  const orderBy =
    query.sort === "deadline"
      ? [{ applicationDeadline: "asc" as const }, { publishedAt: "desc" as const }]
      : [{ publishedAt: "desc" as const }];

  const [total, jobs] = await prisma.$transaction([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      select: publicJobSelect,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  const initialQuery = {
    q: query.q,
    location: query.location,
    workplaceType: query.workplaceType,
    employmentType: query.employmentType,
    experience: query.experience,
    skill: query.skill,
    company: query.company,
    salaryMin: query.salaryMin,
    salaryMax: query.salaryMax,
    page: query.page,
    pageSize: query.pageSize,
    sort: query.sort,
  };

  function toClientJob(job: ReturnType<typeof serializePublicJob>): PublicJob {
    return {
      ...job,
      slug: job.slug ?? null,
      createdAt: job.createdAt instanceof Date ? job.createdAt.toISOString() : (job.createdAt as string),
      updatedAt: job.updatedAt instanceof Date ? job.updatedAt.toISOString() : (job.updatedAt as string),
      publishedAt: job.publishedAt instanceof Date ? job.publishedAt.toISOString() : (job.publishedAt as string | null),
      applicationDeadline: job.applicationDeadline instanceof Date ? job.applicationDeadline.toISOString() : (job.applicationDeadline as string | null),
      workplaceType: job.workplaceType as PublicJob["workplaceType"],
      requiredSkills: job.requiredSkills as string[],
      salaryMin: job.salaryMin !== null ? Number(job.salaryMin) : null,
      salaryMax: job.salaryMax !== null ? Number(job.salaryMax) : null,
    };
  }

  return (
    <JobsPage
      initialJobs={jobs.map(serializePublicJob).map(toClientJob)}
      initialPagination={{
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      }}
      initialQuery={initialQuery}
    />
  );
}
