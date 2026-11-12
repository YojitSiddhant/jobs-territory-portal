import { z } from "zod";

export const companyProfileSchema = z.object({
  name: z.string().trim().min(1).max(160),
  registrationNumber: z.string().trim().min(1).max(100),
  website: z.string().url().max(500),
  officialEmail: z.string().email(),
  phone: z.string().trim().min(7).max(40),
  address: z.string().trim().min(1).max(1000),
  industry: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(5000),
});

export const companyProfileUpdateSchema = companyProfileSchema.partial();

export const companyDocumentSchema = z.object({
  type: z.enum(["REGISTRATION_CERTIFICATE", "TAX_DOCUMENT", "IDENTITY_DOCUMENT", "ADDRESS_PROOF", "OTHER"]),
  storageKey: z.string().regex(/^private\/companies\/[^/]+\/company-document\/[^/]+$/, "Document reference must point to private company storage."),
  originalName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
});
