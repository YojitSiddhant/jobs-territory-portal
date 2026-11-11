export const instant = false;

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { calculateProfileCompletion } from "@/server/candidates/profile-completion";
import { ProfilePage } from "@/features/candidate-profile/components/ProfilePage";
import type { CandidateProfile } from "@/features/candidate-profile/types";

export const metadata: Metadata = {
  title: "My Profile – Jobs Territory",
};

const profileInclude = { education: true, experience: true } as const;

export default async function CandidateProfilePage() {
  const user = await getSessionUser();

  if (!user || user.role !== "CANDIDATE") {
    redirect("/");
  }

  const raw = await prisma.candidateProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
    include: profileInclude,
  });

  const profile: CandidateProfile = {
    id: raw.id,
    fullName: raw.fullName ?? null,
    phone: raw.phone,
    headline: raw.headline,
    bio: raw.bio,
    location: raw.location,
    profilePhotoKey: raw.profilePhotoKey,
    resumeKey: raw.resumeKey,
    skills: Array.isArray(raw.skills) ? (raw.skills as string[]) : null,
    education: raw.education.map((e) => ({
      id: e.id,
      institution: e.institution,
      qualification: e.qualification,
      fieldOfStudy: e.fieldOfStudy,
      startYear: e.startYear,
      endYear: e.endYear,
      description: e.description,
    })),
    experience: raw.experience.map((e) => ({
      id: e.id,
      employer: e.employer,
      jobTitle: e.jobTitle,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate?.toISOString() ?? null,
      isCurrent: e.isCurrent,
      description: e.description,
    })),
    completionPercentage: calculateProfileCompletion({
      ...raw,
      skills: Array.isArray(raw.skills) ? raw.skills : null,
    }),
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };

  return <ProfilePage initialProfile={profile} />;
}
