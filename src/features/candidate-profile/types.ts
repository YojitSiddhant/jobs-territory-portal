export type Education = {
  id?: string;
  institution: string;
  qualification: string;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  description?: string | null;
};

export type Experience = {
  id?: string;
  employer: string;
  jobTitle: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
};

export type CandidateProfile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  profilePhotoKey: string | null;
  resumeKey: string | null;
  skills: string[] | null;
  education: Education[];
  experience: Experience[];
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
};

export type ProfileUpdateInput = {
  fullName?: string | null;
  phone?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  profilePhotoKey?: string | null;
  resumeKey?: string | null;
  skills?: string[] | null;
  education?: Omit<Education, "id">[];
  experience?: Omit<Experience, "id">[];
};
