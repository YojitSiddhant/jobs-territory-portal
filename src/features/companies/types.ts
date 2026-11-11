export type CompanyStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type DocumentType = "REGISTRATION_CERTIFICATE" | "TAX_DOCUMENT" | "IDENTITY_DOCUMENT" | "OTHER";
export type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED";
export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export type CompanyDocument = {
  id: string;
  type: DocumentType;
  storageKey: string;
  originalName: string;
  mimeType: string;
  status: DocumentStatus;
  rejectionReason: string | null;
  createdAt: string;
};

export type CompanyProfile = {
  id: string;
  name: string;
  registrationNumber: string;
  website: string;
  officialEmail: string;
  phone: string;
  address: string;
  industry: string;
  description: string;
  status: CompanyStatus;
  rejectionReason: string | null;
  verificationSubmittedAt: string | null;
  documents: CompanyDocument[];
  createdAt: string;
  updatedAt: string;
};

export type CompanyJob = {
  id: string;
  companyId: string;
  slug: string | null;
  title: string;
  description: string;
  location: string | null;
  workplaceType: string | null;
  employmentType: string | null;
  experienceRequirement: string | null;
  requiredSkills: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  applicationDeadline: string | null;
  status: JobStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CompanyApplication = {
  id: string;
  status: string;
  coverNote: string | null;
  resumeReferenceAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  job: { id: string; slug: string | null; title: string; companyId: string; company: { name: string; slug: string } };
  candidate: { fullName: string | null; headline: string | null; location: string | null } | null;
  statusHistory: { status: string; createdAt: string; actorRole: string }[];
};

export type JobFormInput = {
  title: string;
  description: string;
  location?: string | null;
  workplaceType: "ONSITE" | "HYBRID" | "REMOTE";
  employmentType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";
  experienceRequirement: string;
  requiredSkills: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  applicationDeadline?: string | null;
};
