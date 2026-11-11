import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateProfileCompletion } from "../../src/server/candidates/profile-completion";
import { candidateProfileSchema } from "../../src/shared/validation/candidate-profile";
import { normalizeCandidateProfile } from "../../src/features/candidate-profile/api";

describe("candidate profile", () => {
  it("calculates completion from profile sections", () => {
    const empty = calculateProfileCompletion({ fullName: null, phone: null, headline: null, bio: null, location: null, profilePhotoKey: null, resumeKey: null, skills: null, education: [], experience: [] });
    const complete = calculateProfileCompletion({ fullName: "Candidate", phone: "123", headline: "Engineer", bio: "Bio", location: "Remote", profilePhotoKey: "photo", resumeKey: "resume", skills: ["TypeScript"], education: [{}], experience: [{}] });
    assert.equal(empty, 0);
    assert.equal(complete, 100);
  });

  it("validates private file references and nested profile updates", () => {
    const valid = candidateProfileSchema.safeParse({
      fullName: "Candidate",
      skills: ["TypeScript", "MySQL"],
      profilePhotoKey: "private/candidates/user-1/profile-photo/photo.png",
      resumeKey: "private/candidates/user-1/resume/resume.pdf",
      education: [{ institution: "University", qualification: "BSc", startYear: 2018, endYear: 2022 }],
      experience: [{ employer: "Company", jobTitle: "Developer", startDate: "2022-01-01", isCurrent: true }],
    });
    assert.equal(valid.success, true);
    assert.equal(candidateProfileSchema.safeParse({ profilePhotoKey: "public/photo.png" }).success, false);
    assert.equal(candidateProfileSchema.safeParse({ experience: [{ employer: "Company", jobTitle: "Developer", startDate: "2023-01-01", endDate: "2022-01-01", isCurrent: false }] }).success, false);
  });

  it("normalizes an empty or partial API profile safely", () => {
    const profile = normalizeCandidateProfile({ fullName: "Candidate" });
    assert.equal(profile.fullName, "Candidate");
    assert.equal(profile.completionPercentage, 0);
    assert.deepEqual(profile.education, []);
    assert.deepEqual(profile.experience, []);
    assert.deepEqual(profile.skills, []);
  });
});
