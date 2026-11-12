export type AdminCompanyStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type AdminDocument = {
  id: string;
  type: string;
  status: string;
  originalName: string;
  mimeType: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewer: { id: string; email: string } | null;
  previewPath: string;
  createdAt: string;
};

export type AdminVerificationField = {
  field: string;
  value: string | null;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  reason: string | null;
  reviewedAt: string | null;
  reviewer: { id: string; email: string } | null;
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
  fields: AdminVerificationField[];
  itemReviewHistory: Array<{ id: string; field: string | null; documentId: string | null; decision: string; reason: string | null; createdAt: string; reviewer: { id: string; email: string } }>;
  canApprove: boolean;
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
