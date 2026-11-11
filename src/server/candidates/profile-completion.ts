type ProfileForCompletion = {
  fullName: string | null;
  phone: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  profilePhotoKey: string | null;
  resumeKey: string | null;
  skills: unknown;
  education: unknown[];
  experience: unknown[];
};

const fields: Array<keyof ProfileForCompletion> = [
  "fullName",
  "phone",
  "headline",
  "bio",
  "location",
  "profilePhotoKey",
  "resumeKey",
  "skills",
  "education",
  "experience",
];

export function calculateProfileCompletion(profile: ProfileForCompletion) {
  const completed = fields.filter((field) => {
    const value = profile[field];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }).length;
  return Math.round((completed / fields.length) * 100);
}
