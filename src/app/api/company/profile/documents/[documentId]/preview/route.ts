import { requireRole } from "@/server/auth/authorization";
import { getCurrentCompany } from "@/server/companies/company-profile";
import { prisma } from "@/server/db/prisma";
import { getPrivateStorage } from "@/server/storage/private-storage";
import { apiError } from "@/server/http/api-error";

export async function GET(request: Request, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const user = await requireRole("COMPANY");
    const company = await getCurrentCompany(user.id);
    const document = company ? await prisma.verificationDocument.findFirst({ where: { id: (await params).documentId, companyId: company.id }, select: { storageKey: true, mimeType: true, originalName: true } }) : null;
    if (!document) return Response.json({ error: { code: "DOCUMENT_NOT_FOUND", message: "Document was not found." } }, { status: 404 });
    const object = await getPrivateStorage().get(document.storageKey);
    const download = new URL(request.url).searchParams.get("download") === "1";
    return new Response(Buffer.from(object.body), { headers: { "Content-Type": document.mimeType, "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${document.originalName.replace(/[^a-zA-Z0-9._-]/g, "-")}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return apiError(error); }
}
