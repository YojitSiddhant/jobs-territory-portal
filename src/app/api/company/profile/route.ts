import { Prisma } from "@prisma/client";
import { requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { assertCompanyEditable, companyInclude, companyResponse, getCurrentCompany } from "@/server/companies/company-profile";
import { companyProfileSchema, companyProfileUpdateSchema } from "@/shared/validation/company";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "company";
}

function duplicateRegistrationResponse(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return Response.json({ error: { code: "REGISTRATION_NUMBER_ALREADY_EXISTS", message: "That registration number is already in use." } }, { status: 409 });
  }
  return null;
}

export async function GET() {
  try {
    const user = await requireRole("COMPANY");
    const company = await getCurrentCompany(user.id);
    if (!company) return Response.json({ error: { code: "COMPANY_PROFILE_NOT_FOUND", message: "Create a company profile first." } }, { status: 404 });
    return apiSuccess({ company: companyResponse(company) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole("COMPANY");
    const input = companyProfileSchema.parse(await request.json());
    const current = await getCurrentCompany(user.id);
    if (current) assertCompanyEditable(current);
    const company = await prisma.company.upsert({
      where: { ownerId: user.id },
      create: {
        ownerId: user.id,
        name: input.name,
        slug: `${slugify(input.name)}-${user.id.slice(-8)}`,
        registrationNumber: input.registrationNumber,
        website: input.website,
        contactEmail: input.officialEmail.toLowerCase(),
        phone: input.phone,
        address: input.address,
        industry: input.industry,
        description: input.description,
        status: "PENDING",
      },
      update: {
        name: input.name,
        registrationNumber: input.registrationNumber,
        website: input.website,
        contactEmail: input.officialEmail.toLowerCase(),
        phone: input.phone,
        address: input.address,
        industry: input.industry,
        description: input.description,
        status: "PENDING",
        rejectionReason: null,
        verificationSubmittedAt: null,
      },
      include: companyInclude,
    });
    return apiSuccess({ company: companyResponse(company) }, { status: current ? 200 : 201 });
  } catch (error) {
    return duplicateRegistrationResponse(error) ?? apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireRole("COMPANY");
    const current = await getCurrentCompany(user.id);
    if (!current) return Response.json({ error: { code: "COMPANY_PROFILE_NOT_FOUND", message: "Create a company profile first." } }, { status: 404 });
    assertCompanyEditable(current);
    const input = companyProfileUpdateSchema.parse(await request.json());
    const company = await prisma.company.update({ where: { id: current.id }, data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.registrationNumber !== undefined ? { registrationNumber: input.registrationNumber } : {}),
      ...(input.website !== undefined ? { website: input.website } : {}),
      ...(input.officialEmail !== undefined ? { contactEmail: input.officialEmail.toLowerCase() } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.industry !== undefined ? { industry: input.industry } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
    }, include: companyInclude });
    return apiSuccess({ company: companyResponse(company) });
  } catch (error) {
    return duplicateRegistrationResponse(error) ?? apiError(error);
  }
}
