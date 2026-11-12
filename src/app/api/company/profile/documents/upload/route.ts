import { requireRole } from "@/server/auth/authorization";
import { assertCompanyEditable, getCurrentCompany } from "@/server/companies/company-profile";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { createPrivateObjectKey, getPrivateStorage, validateUpload } from "@/server/storage/private-storage";

export async function POST(request: Request) {
  try {
    const user = await requireRole("COMPANY");
    const company = await getCurrentCompany(user.id);
    if (!company) return Response.json({ error: { code: "COMPANY_PROFILE_NOT_FOUND", message: "Create a company profile first." } }, { status: 404 });
    assertCompanyEditable(company);
    const form = await request.formData();
    const file = form.get("file"); const type = form.get("type");
    if (!(file instanceof File) || typeof type !== "string" || !["REGISTRATION_CERTIFICATE", "TAX_DOCUMENT", "IDENTITY_DOCUMENT", "ADDRESS_PROOF", "OTHER"].includes(type)) return Response.json({ error: { code: "INVALID_UPLOAD", message: "Provide a file and valid document type." } }, { status: 400 });
    validateUpload(file, "company-document");
    const key = createPrivateObjectKey(company.id, "company-document", file.name);
    await getPrivateStorage().put({ key, contentType: file.type, sizeBytes: file.size, body: new Uint8Array(await file.arrayBuffer()) });
    const document = await prisma.verificationDocument.create({ data: { companyId: company.id, type: type as "REGISTRATION_CERTIFICATE" | "TAX_DOCUMENT" | "IDENTITY_DOCUMENT" | "ADDRESS_PROOF" | "OTHER", storageKey: key, originalName: file.name.replace(/[^a-zA-Z0-9._-]/g, "-"), mimeType: file.type, status: "PENDING" } });
    return apiSuccess({ document: { id: document.id, type: document.type, status: document.status, originalName: document.originalName, mimeType: document.mimeType } }, { status: 201 });
  } catch (error) { return apiError(error); }
}
