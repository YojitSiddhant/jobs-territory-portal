export type ApplicationStatus =
  | "APPLIED"
  | "REVIEWING"
  | "SHORTLISTED"
  | "REJECTED"
  | "HIRED"
  | "WITHDRAWN";

export type StatusHistoryEntry = {
  status: ApplicationStatus;
  createdAt: string;
  actorRole: string;
};

export type Application = {
  id: string;
  status: ApplicationStatus;
  coverNote: string | null;
  resumeReferenceAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    slug: string | null;
    title: string;
    companyId: string;
    company: { name: string; slug: string };
  };
  candidate: {
    fullName: string | null;
    headline: string | null;
    location: string | null;
  } | null;
  statusHistory: StatusHistoryEntry[];
};
