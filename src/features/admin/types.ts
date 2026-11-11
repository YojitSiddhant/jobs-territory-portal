export type AdminCompanyStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type AdminDocument = {
  id: string;
  type: string;
  status: string;
  originalName: string;
  mimeType: string;
  storageKey: string;
  rejectionReason: string | null;
  createdAt: string;
};

export type AdminReview = {
  id: string;
  decision: string;
  reason: string | null;
  createdAt: string;
  admin: { id: string; email: string };
};

export type AdminCompany = {
  id: string;
  owner: { id: string; email: string; role: string };
  name: string | null;
  registrationNumber: string | null;
  website: string | null;
  officialEmail: string | null;
  phone: string | null;
  address: string | null;
  industry: string | null;
  description: string | null;
  status: AdminCompanyStatus;
  rejectionReason: string | null;
  verificationSubmittedAt: string | null;
  documents: AdminDocument[];
  reviews: AdminReview[];
  createdAt: string;
  updatedAt: string;
};

export type VerificationCounts = {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  SUSPENDED: number;
};
