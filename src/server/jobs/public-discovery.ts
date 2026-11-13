import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { normalizeDiscoveryQuery } from "@/shared/validation/job-discovery";

type DiscoveryQuery = ReturnType<typeof normalizeDiscoveryQuery>;

// Canonical spellings for skills whose casing a plain case transform cannot
// produce. Keys are the lowercased search term.
const canonicalSkillSpellings: Record<string, string> = {
  mysql: "MySQL", typescript: "TypeScript", javascript: "JavaScript", postgresql: "PostgreSQL",
  graphql: "GraphQL", mongodb: "MongoDB", nosql: "NoSQL", php: "PHP", devops: "DevOps",
};

/**
 * requiredSkills is a JSON string array. On MySQL, Prisma's `string_contains`
 * never matches inside a JSON array, so it silently returned zero results for
 * every skill filter. `array_contains` does match array elements but compares
 * exactly and case-sensitively, so the filter checks the term's common case
 * variants (as typed, lower, UPPER, Sentence case, Title Case, and known
 * canonical spellings such as MySQL).
 */
export function skillTermVariants(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed) return [];
  const lower = trimmed.toLowerCase();
  const sentence = lower.charAt(0).toUpperCase() + lower.slice(1);
  const title = lower.replace(/(^|\s)([a-z])/g, (match) => match.toUpperCase());
  const variants = [trimmed, lower, trimmed.toUpperCase(), sentence, title];
  const canonical = canonicalSkillSpellings[lower];
  if (canonical) variants.push(canonical);
  return [...new Set(variants)];
}

export function skillFilter(term: string): Prisma.JobWhereInput {
  return { OR: skillTermVariants(term).map((variant) => ({ requiredSkills: { array_contains: variant } })) };
}

/** Builds the shared public-discovery where clause used by the browse page and /api/jobs. */
export function buildDiscoveryWhere(query: DiscoveryQuery, now: Date): Prisma.JobWhereInput {
  const andFilters: Prisma.JobWhereInput[] = [{ OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: now } }] }];
  if (query.q)
    andFilters.push({
      OR: [
        { title: { contains: query.q } },
        { description: { contains: query.q } },
        { company: { name: { contains: query.q } } },
        ...skillTermVariants(query.q).map((variant) => ({ requiredSkills: { array_contains: variant } })),
      ],
    });
  if (query.company) andFilters.push({ company: { is: { OR: [{ id: query.company }, { name: { contains: query.company } }] } } });
  if (query.salaryMin !== undefined) andFilters.push({ OR: [{ salaryMax: null }, { salaryMax: { gte: query.salaryMin } }] });
  if (query.salaryMax !== undefined) andFilters.push({ OR: [{ salaryMin: null }, { salaryMin: { lte: query.salaryMax } }] });
  if (query.skill) andFilters.push(skillFilter(query.skill));
  return {
    status: "PUBLISHED",
    company: { status: "APPROVED" },
    AND: andFilters,
    ...(query.location ? { location: { contains: query.location } } : {}),
    ...(query.workplaceType ? { workplaceType: query.workplaceType } : {}),
    ...(query.employmentType ? { employmentType: query.employmentType } : {}),
    ...(query.experience ? { experienceRequirement: { contains: query.experience } } : {}),
  };
}

export function buildDiscoveryOrderBy(sort: DiscoveryQuery["sort"]) {
  return sort === "deadline"
    ? [{ applicationDeadline: "asc" as const }, { publishedAt: "desc" as const }]
    : [{ publishedAt: "desc" as const }];
}

export const publicJobSelect = {
  id: true, slug: true, title: true, description: true, location: true, workplaceType: true, employmentType: true, experienceRequirement: true,
  requiredSkills: true, salaryMin: true, salaryMax: true, applicationDeadline: true, publishedAt: true, createdAt: true, updatedAt: true,
  company: { select: { id: true, name: true, slug: true, industry: true, website: true } },
} as const;

export type PublicJob = Awaited<ReturnType<typeof getPublicJob>>;

export function isDiscoverableJob(status: string, companyStatus: string, applicationDeadline: Date | null, now = new Date()) {
  return status === "PUBLISHED" && companyStatus === "APPROVED" && (applicationDeadline === null || applicationDeadline >= now);
}

export async function getPublicJob(slug: string) {
  return prisma.job.findFirst({ where: { slug, status: "PUBLISHED", OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: new Date() } }], company: { status: "APPROVED" } }, select: publicJobSelect });
}

export function serializePublicJob(job: NonNullable<PublicJob>) {
  return { ...job, requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [] };
}
