export type WorkplaceType = "ONSITE" | "HYBRID" | "REMOTE";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";

export type PublicJob = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  location: string | null;
  workplaceType: WorkplaceType | null;
  employmentType: string | null;
  experienceRequirement: string | null;
  requiredSkills: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  applicationDeadline: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
    industry: string | null;
    website: string | null;
  };
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type JobsResponse = {
  jobs: PublicJob[];
  pagination: Pagination;
};

export type JobDetailResponse = {
  job: PublicJob;
  application: { hasApplied: boolean };
};

export type JobDiscoveryQuery = {
  q?: string;
  location?: string;
  workplaceType?: WorkplaceType;
  employmentType?: EmploymentType;
  experience?: string;
  skill?: string;
  company?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  pageSize?: number;
  sort?: "newest" | "deadline";
};
