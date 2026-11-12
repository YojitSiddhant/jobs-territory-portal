"use client";

import { useState, useEffect } from "react";
import type { CandidateProfile, Education, Experience } from "../types";
import { emptyCandidateProfile, fetchProfile, normalizeCandidateProfile, privateFileUrl, updateProfile, uploadCandidateFile } from "../api";
import { ProfileCompletion } from "./ProfileCompletion";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { EducationSection } from "./EducationSection";
import { ExperienceSection } from "./ExperienceSection";
import { SkillsSection } from "./SkillsSection";
import { UploadField } from "./UploadField";
import { FilePreviewModal } from "./FilePreviewModal";

type FormState = {
  fullName: string;
  phone: string;
  headline: string;
  bio: string;
  location: string;
  profilePhotoKey: string | null;
  resumeKey: string | null;
  skills: string[];
  education: Education[];
  experience: Experience[];
};

function profileToForm(p: CandidateProfile): FormState {
  return {
    fullName: p.fullName ?? "",
    phone: p.phone ?? "",
    headline: p.headline ?? "",
    bio: p.bio ?? "",
    location: p.location ?? "",
    profilePhotoKey: p.profilePhotoKey,
    resumeKey: p.resumeKey,
    skills: p.skills ?? [],
    education: p.education,
    experience: p.experience,
  };
}

type Props = {
  initialProfile?: CandidateProfile | null;
};

export function ProfilePage({ initialProfile }: Props) {
  const safeInitialProfile = normalizeCandidateProfile(initialProfile ?? emptyCandidateProfile());
  const [profile, setProfile] = useState<CandidateProfile>(safeInitialProfile);
  const [form, setForm] = useState<FormState>(profileToForm(safeInitialProfile));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uploadingKind, setUploadingKind] = useState<"profile-photo" | "resume" | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<"profile-photo" | "resume" | null>(null);
  const [removingKind, setRemovingKind] = useState<"profile-photo" | "resume" | null>(null);

  useEffect(() => {
    if (!saveSuccess) return;
    const id = setTimeout(() => setSaveSuccess(false), 3000);
    return () => clearTimeout(id);
  }, [saveSuccess]);

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const updated = await updateProfile({
        fullName: form.fullName.trim() || null,
        phone: form.phone.trim() || null,
        headline: form.headline.trim() || null,
        bio: form.bio.trim() || null,
        location: form.location.trim() || null,
        profilePhotoKey: form.profilePhotoKey,
        resumeKey: form.resumeKey,
        skills: form.skills.length > 0 ? form.skills : null,
        education: form.education.map((e) => ({
          institution: e.institution,
          qualification: e.qualification,
          fieldOfStudy: e.fieldOfStudy,
          startYear: e.startYear,
          endYear: e.endYear,
          description: e.description,
        })),
        experience: form.experience.map((e) => ({
          employer: e.employer,
          jobTitle: e.jobTitle,
          startDate: e.startDate,
          endDate: e.endDate,
          isCurrent: e.isCurrent,
          description: e.description,
        })),
      });
      setProfile(updated);
      setForm(profileToForm(updated));
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const fresh = normalizeCandidateProfile(await fetchProfile());
      setProfile(fresh);
      setForm(profileToForm(fresh));
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to load your profile.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleUpload(kind: "profile-photo" | "resume", file: File) {
    const allowed = kind === "profile-photo" ? ["image/jpeg", "image/png", "image/webp"] : ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const limit = kind === "profile-photo" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (!allowed.includes(file.type)) { setUploadError("This file type is not supported."); return; }
    if (file.size <= 0 || file.size > limit) { setUploadError(`File is too large. Maximum size is ${limit / 1024 / 1024} MB.`); return; }
    setUploadError(null); setUploadingKind(kind); setUploadProgress(0);
    try {
      await uploadCandidateFile(kind, file, setUploadProgress);
      const fresh = normalizeCandidateProfile(await fetchProfile());
      setProfile(fresh);
      setForm(profileToForm(fresh));
      setSaveSuccess(true);
    } catch (err) { setUploadError(err instanceof Error ? err.message : "Upload failed."); }
    finally { setUploadingKind(null); }
  }

  async function handleRemove(kind: "profile-photo" | "resume") {
    setRemovingKind(kind); setUploadError(null);
    try {
      const updated = await updateProfile(kind === "profile-photo" ? { profilePhotoKey: null } : { resumeKey: null });
      setProfile(updated); setForm((current) => ({ ...current, ...(kind === "profile-photo" ? { profilePhotoKey: null } : { resumeKey: null }) })); setSaveSuccess(true);
    } catch (err) { setUploadError(err instanceof Error ? err.message : "Could not remove the file."); }
    finally { setRemovingKind(null); }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-600 mb-1">
              Jobs Territory
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Your profile
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Keep your profile up to date so employers can find you.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh profile"
            className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={isRefreshing ? "animate-spin" : ""}
            >
              <path
                d="M13.5 2.5A6.5 6.5 0 1 1 8 1.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path d="M13.5 2.5V6h-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Profile completion */}
        <ProfileCompletion percentage={profile.completionPercentage} />

        {/* Personal info */}
        <PersonalInfoSection
          value={{
            fullName: form.fullName,
            phone: form.phone,
            headline: form.headline,
            bio: form.bio,
            location: form.location,
            profilePhotoKey: form.profilePhotoKey,
          }}
          onChange={(v) => setForm((f) => ({ ...f, ...v }))}
          onUpload={(file) => handleUpload("profile-photo", file)}
          isUploading={uploadingKind === "profile-photo"}
          uploadProgress={uploadingKind === "profile-photo" ? uploadProgress : 0}
          previewUrl={privateFileUrl(form.profilePhotoKey)}
          onPreview={() => setPreviewKind("profile-photo")}
          onRemove={() => void handleRemove("profile-photo")}
          isRemoving={removingKind === "profile-photo"}
        />

        {/* Resume */}
        <section className="rounded-2xl bg-white border border-gray-200 p-6 space-y-3 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Resume</h2>
          <UploadField
            label="Your resume / CV"
            kind="resume"
            fileKey={form.resumeKey}
            onClear={() => void handleRemove("resume")}
            onUpload={(file) => handleUpload("resume", file)}
            isUploading={uploadingKind === "resume"}
            uploadProgress={uploadingKind === "resume" ? uploadProgress : 0}
            previewUrl={privateFileUrl(form.resumeKey)}
            onPreview={() => setPreviewKind("resume")}
            isRemoving={removingKind === "resume"}
          />
          {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
        </section>

        {/* Education */}
        <EducationSection
          value={form.education}
          onChange={(education) => setForm((f) => ({ ...f, education }))}
        />

        {/* Experience */}
        <ExperienceSection
          value={form.experience}
          onChange={(experience) => setForm((f) => ({ ...f, experience }))}
        />

        {/* Skills */}
        <SkillsSection
          value={form.skills}
          onChange={(skills) => setForm((f) => ({ ...f, skills }))}
        />

        {/* Save bar */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-white/90 backdrop-blur border-t border-gray-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M12 7A5 5 0 1 1 7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>

            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-blue-600">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M12 3.5L5.5 10 2 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Saved
              </span>
            )}

            {saveError && (
              <span className="text-sm text-red-600">{saveError}</span>
            )}
          </div>
        </div>
      </div>
      {previewKind && privateFileUrl(previewKind === "profile-photo" ? form.profilePhotoKey : form.resumeKey) && <FilePreviewModal kind={previewKind} previewUrl={privateFileUrl(previewKind === "profile-photo" ? form.profilePhotoKey : form.resumeKey)!} onClose={() => setPreviewKind(null)} />}
    </main>
  );
}
