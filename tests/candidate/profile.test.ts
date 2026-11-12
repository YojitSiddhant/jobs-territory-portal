import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateProfileCompletion } from "../../src/server/candidates/profile-completion";
import { candidateProfileSchema } from "../../src/shared/validation/candidate-profile";
import { normalizeCandidateProfile, parseUploadResponse, privateFileUrl } from "../../src/features/candidate-profile/api";

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

  it("keeps the server response nested under the standard API success envelope", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ data: { profile: {
      fullName: "Candidate", skills: ["TypeScript"], education: [{ institution: "University", qualification: "BSc" }],
      experience: [{ employer: "Company", jobTitle: "Developer", startDate: "2022-01-01", isCurrent: true }], completionPercentage: 50,
    } } }), { status: 200 });
    try {
      const { fetchProfile, updateProfile } = await import("../../src/features/candidate-profile/api");
      const profile = await fetchProfile();
      assert.equal(profile.skills?.[0], "TypeScript");
      assert.equal(profile.education.length, 1);
      assert.equal(profile.experience.length, 1);
      assert.equal(profile.completionPercentage, 50);
      const saved = await updateProfile({ skills: ["TypeScript"] });
      assert.equal(saved.fullName, "Candidate");
      assert.equal(saved.skills?.[0], "TypeScript");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("does not turn a missing save response into an empty profile", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ data: {} }), { status: 200 });
    try {
      const { updateProfile } = await import("../../src/features/candidate-profile/api");
      await assert.rejects(() => updateProfile({ fullName: "Candidate" }), /profile response was incomplete/i);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("builds protected preview URLs without exposing filesystem paths", () => {
    assert.equal(privateFileUrl("private/candidates/user-1/profile-photo/photo.png"), "/api/private-files/private/candidates/user-1/profile-photo/photo.png");
    assert.equal(privateFileUrl(null), null);
  });

  it("parses upload success and errors from the standard API envelope", () => {
    assert.deepEqual(parseUploadResponse(201, JSON.stringify({ data: { key: "private/candidates/user-1/resume/file.pdf" } })), { key: "private/candidates/user-1/resume/file.pdf" });
    assert.throws(() => parseUploadResponse(201, JSON.stringify({ data: {} })), /upload failed/i);
    assert.throws(() => parseUploadResponse(403, JSON.stringify({ error: { message: "Forbidden" } })), /forbidden/i);
  });
});
