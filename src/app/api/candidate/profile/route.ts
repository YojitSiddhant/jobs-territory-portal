import { Prisma } from "@prisma/client";
import { requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { calculateProfileCompletion } from "@/server/candidates/profile-completion";
import { candidateProfileSchema } from "@/shared/validation/candidate-profile";

const profileInclude = { education: true, experience: true } as const;
type ProfileWithRelations = Prisma.CandidateProfileGetPayload<{ include: typeof profileInclude }>;

function responseFor(profile: ProfileWithRelations) {
  return {
    id: profile.id,
    fullName: profile.fullName,
    phone: profile.phone,
    headline: profile.headline,
    bio: profile.bio,
    location: profile.location,
    profilePhotoKey: profile.profilePhotoKey,
    resumeKey: profile.resumeKey,
    skills: profile.skills,
    education: profile.education,
    experience: profile.experience,
    completionPercentage: calculateProfileCompletion(profile),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

async function getProfile(userId: string) {
  return prisma.candidateProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: profileInclude,
  });
}

export async function GET() {
  try {
    const user = await requireRole("CANDIDATE");
    return apiSuccess({ profile: responseFor(await getProfile(user.id)) });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireRole("CANDIDATE");
    const input = candidateProfileSchema.parse(await request.json());
    const profile = await prisma.$transaction(async (tx) => {
      const scalarData: Prisma.CandidateProfileUpdateInput = {};
      for (const field of ["fullName", "phone", "headline", "bio", "location", "profilePhotoKey", "resumeKey"] as const) {
        if (input[field] !== undefined) scalarData[field] = input[field];
      }
      if (input.skills !== undefined) scalarData.skills = input.skills ?? Prisma.JsonNull;
      if (input.education !== undefined) {
        scalarData.education = { deleteMany: {}, create: input.education };
      }
      if (input.experience !== undefined) {
        scalarData.experience = { deleteMany: {}, create: input.experience };
      }

      const createData: Prisma.CandidateProfileCreateInput = {
        user: { connect: { id: user.id } },
        fullName: input.fullName,
        phone: input.phone,
        headline: input.headline,
        bio: input.bio,
        location: input.location,
        profilePhotoKey: input.profilePhotoKey,
        resumeKey: input.resumeKey,
        skills: input.skills === null ? Prisma.JsonNull : input.skills,
        education: input.education ? { create: input.education } : undefined,
        experience: input.experience ? { create: input.experience } : undefined,
      };

      return tx.candidateProfile.upsert({
        where: { userId: user.id },
        create: createData,
        update: scalarData,
        include: profileInclude,
      });
    });
    return apiSuccess({ profile: responseFor(profile) });
  } catch (error) {
    return apiError(error);
  }
}
