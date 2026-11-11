"use client";

import { UploadField } from "./UploadField";

type PersonalInfo = {
  fullName: string;
  phone: string;
  headline: string;
  bio: string;
  location: string;
  profilePhotoKey: string | null;
};

type Props = {
  value: PersonalInfo;
  onChange: (value: PersonalInfo) => void;
  onUpload: (file: File) => Promise<void>;
};

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors";

export function PersonalInfoSection({ value, onChange, onUpload }: Props) {
  const set = (key: keyof PersonalInfo, v: string | null) =>
    onChange({ ...value, [key]: v });

  return (
    <section className="rounded-2xl bg-white border border-gray-200 p-6 space-y-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">Personal information</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" id="fullName">
          <input
            id="fullName"
            type="text"
            maxLength={120}
            placeholder="Your full name"
            value={value.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Phone" id="phone">
          <input
            id="phone"
            type="tel"
            maxLength={40}
            placeholder="+1 234 567 8900"
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Headline" id="headline">
        <input
          id="headline"
          type="text"
          maxLength={160}
          placeholder="e.g. Fresh Graduate · Computer Science · Open to work"
          value={value.headline}
          onChange={(e) => set("headline", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Location" id="location">
        <input
          id="location"
          type="text"
          maxLength={160}
          placeholder="City, Country"
          value={value.location}
          onChange={(e) => set("location", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Bio" id="bio">
        <textarea
          id="bio"
          maxLength={5000}
          rows={4}
          placeholder="Tell employers a little about yourself…"
          value={value.bio}
          onChange={(e) => set("bio", e.target.value)}
          className={`${inputClass} resize-none`}
        />
        <p className="text-right text-xs text-gray-400">{value.bio.length}/5000</p>
      </Field>

      <UploadField
        label="Profile photo"
        kind="profile-photo"
        fileKey={value.profilePhotoKey}
        onClear={() => set("profilePhotoKey", null)}
        onUpload={onUpload}
      />
    </section>
  );
}
