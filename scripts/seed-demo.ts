/**
 * Local demo-data seeder for Jobs Territory.
 *
 * Usage: npm run db:seed:demo
 *
 * - Development only: refuses to run when NODE_ENV === "production".
 * - Idempotent: every record is looked up by a deterministic demo key
 *   (.test emails, demo slugs, demo registration numbers) and created
 *   only when missing. Existing rows are never updated or deleted, so
 *   real accounts and user-created data are never touched.
 * - All demo accounts use @example.test emails and one documented
 *   local-only password (see docs/demo-data.md).
 */
import { prisma } from "@/server/db/prisma";
import { hashPassword } from "@/server/auth/password";
import { getPrivateStorage } from "@/server/storage/private-storage";
import { verificationFields } from "@/server/admin/company-verification";
import { Prisma } from "@prisma/client";
import type { ApplicationStatus, CompanyStatus, JobStatus, WorkplaceType } from "@prisma/client";

const DEMO_DOMAIN = "example.test";
const DEMO_PASSWORD = "Demo!Local12345"; // Local-only demo password, documented in docs/demo-data.md.
const ADMIN_EMAIL = `admin.demo@${DEMO_DOMAIN}`;

const now = new Date();
const day = 24 * 60 * 60 * 1000;
const daysFromNow = (n: number) => new Date(now.getTime() + n * day);

const created = {
  users: 0, candidateProfiles: 0, education: 0, experience: 0,
  companies: 0, documents: 0, fieldReviews: 0, documentReviews: 0,
  adminReviewRecords: 0, jobs: 0, applications: 0, statusHistory: 0, demoFiles: 0,
};
const skipped: string[] = [];

function assertDemoEmail(email: string) {
  if (!email.endsWith(`@${DEMO_DOMAIN}`)) throw new Error(`Refusing to touch non-demo account: ${email}`);
}

// ---------------------------------------------------------------- demo files

const DEMO_PHOTO_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

function demoPdf(lines: string[]): Buffer {
  const text = lines.map((line, i) => `BT /F1 12 Tf 72 ${720 - i * 18} Td (${line.replace(/[()\\]/g, "")}) Tj ET`).join("\n");
  const stream = `${text}\n`;
  return Buffer.from(
    `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n` +
      `3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n` +
      `4 0 obj<</Length ${stream.length}>>stream\n${stream}endstream endobj\n` +
      `5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n`,
    "latin1",
  );
}

/** Writes a demo file into local private storage. Returns false when storage is unavailable. */
async function putDemoFile(key: string, body: Buffer, contentType: string): Promise<boolean> {
  try {
    const storage = getPrivateStorage();
    await storage.put({ key, body, contentType, sizeBytes: body.length });
    created.demoFiles++;
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EEXIST") return true; // already seeded
    skipped.push(`demo file ${key.split("/").pop()} (local storage unavailable)`);
    return false;
  }
}

// --------------------------------------------------------------------- users

async function ensureUser(email: string, role: "CANDIDATE" | "COMPANY" | "ADMIN", passwordHash: string) {
  assertDemoEmail(email);
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
  if (existing) {
    if (existing.role !== role) throw new Error(`User ${email} exists with role ${existing.role}; refusing to modify it.`);
    return existing.id;
  }
  const user = await prisma.user.create({ data: { email, passwordHash, role }, select: { id: true } });
  created.users++;
  return user.id;
}

// ---------------------------------------------------------------- candidates

type CandidateSpec = {
  email: string; fullName: string; phone?: string; headline?: string; bio?: string; location?: string;
  skills?: string[]; withResume?: boolean; withPhoto?: boolean;
  education?: { institution: string; qualification: string; fieldOfStudy?: string; startYear: number; endYear?: number }[];
  experience?: { employer: string; jobTitle: string; startMonthsAgo: number; endMonthsAgo?: number; isCurrent?: boolean; description?: string }[];
};

const candidateSpecs: CandidateSpec[] = [
  { email: "candidate01@example.test", fullName: "Aarav Demo", phone: "+91 00000 00101 (demo)", headline: "Frontend Engineer — React & TypeScript", bio: "Demo candidate profile. Four years building dashboards and design systems with React, Next.js and TypeScript.", location: "Bengaluru", skills: ["React", "Next.js", "TypeScript", "Git"], withResume: true, withPhoto: true,
    education: [{ institution: "Demo Institute of Technology", qualification: "B.E.", fieldOfStudy: "Computer Science", startYear: 2016, endYear: 2020 }],
    experience: [{ employer: "Fictional Web Co", jobTitle: "Frontend Engineer", startMonthsAgo: 36, isCurrent: true, description: "Builds and maintains customer-facing React applications." }] },
  { email: "candidate02@example.test", fullName: "Diya Sample", phone: "+91 00000 00102 (demo)", headline: "Backend Developer — Node.js", bio: "Demo candidate. Node.js and SQL services, API design, and background workers.", location: "Hyderabad", skills: ["Node.js", "TypeScript", "SQL", "MySQL", "AWS"], withResume: true,
    education: [{ institution: "Sample University", qualification: "B.Tech", fieldOfStudy: "Information Technology", startYear: 2015, endYear: 2019 }],
    experience: [{ employer: "Imaginary Services Ltd", jobTitle: "Backend Developer", startMonthsAgo: 48, endMonthsAgo: 10 }, { employer: "Placeholder Tech", jobTitle: "Senior Backend Developer", startMonthsAgo: 10, isCurrent: true }] },
  { email: "candidate03@example.test", fullName: "Vihaan Tester", headline: "Full-stack Developer", bio: "Demo candidate covering full-stack roles with React and Node.js.", location: "Pune", skills: ["React", "Node.js", "SQL", "Git"], withResume: true,
    education: [{ institution: "Demo Institute of Technology", qualification: "B.Sc", fieldOfStudy: "Computer Applications", startYear: 2017, endYear: 2020 }],
    experience: [{ employer: "Mock Labs", jobTitle: "Software Developer", startMonthsAgo: 30, isCurrent: true }] },
  { email: "candidate04@example.test", fullName: "Ananya Placeholder", phone: "+91 00000 00104 (demo)", headline: "Data Analyst", bio: "Demo candidate focused on analytics, SQL and Python reporting pipelines.", location: "Chennai", skills: ["Python", "SQL", "Data analysis"], withResume: true,
    education: [{ institution: "Fictional College of Science", qualification: "M.Sc", fieldOfStudy: "Statistics", startYear: 2018, endYear: 2020 }],
    experience: [{ employer: "Pretend Analytics", jobTitle: "Data Analyst", startMonthsAgo: 24, isCurrent: true }] },
  { email: "candidate05@example.test", fullName: "Arjun Example", headline: "Java Developer", location: "Mysuru", skills: ["Java", "SQL", "Git"], withResume: true,
    education: [{ institution: "Sample University", qualification: "B.E.", fieldOfStudy: "Computer Science", startYear: 2014, endYear: 2018 }],
    experience: [{ employer: "Hypothetical Systems", jobTitle: "Java Developer", startMonthsAgo: 60, endMonthsAgo: 6 }] },
  { email: "candidate06@example.test", fullName: "Ishita Mockdata", phone: "+91 00000 00106 (demo)", headline: "UI/UX Designer", bio: "Demo candidate. Product design, prototyping and design systems.", location: "Bengaluru", skills: ["UI/UX", "React"], withPhoto: true,
    education: [{ institution: "Demo School of Design", qualification: "B.Des", fieldOfStudy: "Interaction Design", startYear: 2016, endYear: 2020 }],
    experience: [{ employer: "Make-believe Studio", jobTitle: "Product Designer", startMonthsAgo: 40, isCurrent: true }] },
  { email: "candidate07@example.test", fullName: "Kabir Dummy", headline: "DevOps Engineer", location: "Remote", skills: ["AWS", "Python", "Git"], withResume: true,
    experience: [{ employer: "Nonexistent Cloud Co", jobTitle: "DevOps Engineer", startMonthsAgo: 20, isCurrent: true }] },
  { email: "candidate08@example.test", fullName: "Meera Testuser", headline: "Junior Web Developer", bio: "Demo candidate. Recent graduate looking for a first full-time role.", location: "Hyderabad", skills: ["React", "Git"],
    education: [{ institution: "Fictional College of Science", qualification: "B.C.A", fieldOfStudy: "Computer Applications", startYear: 2021, endYear: 2024 }] },
  { email: "candidate09@example.test", fullName: "Rohan Specimen", headline: "QA Engineer", location: "Pune", skills: ["Python", "SQL", "Git"], withResume: true,
    experience: [{ employer: "Illustrative QA Ltd", jobTitle: "QA Engineer", startMonthsAgo: 28, isCurrent: true }] },
  { email: "candidate10@example.test", fullName: "Sara Demoaccount", headline: "Data Engineer", bio: "Demo candidate. Pipelines with Python, SQL and AWS.", location: "Chennai", skills: ["Python", "SQL", "AWS", "Data analysis"], withResume: true,
    education: [{ institution: "Sample University", qualification: "B.Tech", fieldOfStudy: "Computer Science", startYear: 2013, endYear: 2017 }],
    experience: [{ employer: "Notional Data Corp", jobTitle: "Data Engineer", startMonthsAgo: 55, isCurrent: true }] },
  { email: "candidate11@example.test", fullName: "Advait Mockprofile", location: "Bengaluru" },
  { email: "candidate12@example.test", fullName: "Nisha Sampledata", headline: "Mobile Developer", location: "Mysuru", skills: ["TypeScript", "React"] },
  { email: "candidate13@example.test", fullName: "Yash Placeholderson" },
  { email: "candidate14@example.test", fullName: "Tara Examplewala", headline: "Technical Writer", bio: "Demo candidate with a partially completed profile.", location: "Remote", skills: ["Git"],
    education: [{ institution: "Demo Institute of Technology", qualification: "B.A.", fieldOfStudy: "English", startYear: 2015, endYear: 2018 }] },
];

async function ensureCandidate(spec: CandidateSpec, passwordHash: string) {
  const userId = await ensureUser(spec.email, "CANDIDATE", passwordHash);
  const existing = await prisma.candidateProfile.findUnique({ where: { userId }, select: { id: true } });
  if (existing) return userId;

  let resumeKey: string | null = null;
  if (spec.withResume) {
    const key = `private/candidates/${userId}/resume/demo-resume.pdf`;
    const ok = await putDemoFile(key, demoPdf([
      `${spec.fullName} - Demo Resume (fictional, for local testing only)`,
      spec.headline ?? "Software professional",
      `Location: ${spec.location ?? "India"}`,
      `Skills: ${(spec.skills ?? []).join(", ") || "General"}`,
      ...(spec.experience ?? []).map((e) => `${e.jobTitle} at ${e.employer}`),
      ...(spec.education ?? []).map((e) => `${e.qualification}, ${e.institution}`),
    ]), "application/pdf");
    if (ok) resumeKey = key;
  }
  let profilePhotoKey: string | null = null;
  if (spec.withPhoto) {
    const key = `private/candidates/${userId}/profile-photo/demo-photo.png`;
    if (await putDemoFile(key, DEMO_PHOTO_PNG, "image/png")) profilePhotoKey = key;
  }

  await prisma.candidateProfile.create({
    data: {
      userId,
      fullName: spec.fullName,
      phone: spec.phone ?? null,
      headline: spec.headline ?? null,
      bio: spec.bio ?? null,
      location: spec.location ?? null,
      skills: spec.skills && spec.skills.length > 0 ? spec.skills : Prisma.JsonNull,
      resumeKey,
      profilePhotoKey,
      education: { create: (spec.education ?? []).map((e) => ({ institution: e.institution, qualification: e.qualification, fieldOfStudy: e.fieldOfStudy ?? null, startYear: e.startYear, endYear: e.endYear ?? null })) },
      experience: { create: (spec.experience ?? []).map((e) => ({ employer: e.employer, jobTitle: e.jobTitle, startDate: daysFromNow(-e.startMonthsAgo * 30), endDate: e.endMonthsAgo !== undefined ? daysFromNow(-e.endMonthsAgo * 30) : null, isCurrent: e.isCurrent ?? false, description: e.description ?? null })) },
    },
  });
  created.candidateProfiles++;
  created.education += spec.education?.length ?? 0;
  created.experience += spec.experience?.length ?? 0;
  return userId;
}

// ----------------------------------------------------------------- companies

type CompanySpec = {
  email: string; name: string; slug: string; registrationNumber: string; website: string; contactEmail: string;
  phone: string; industry: string; address: string; description: string;
  status: CompanyStatus; rejectionReason?: string;
};

const companySpecs: CompanySpec[] = [
  { email: "company01@example.test", name: "NovaByte Labs", slug: "demo-novabyte-labs", registrationNumber: "DEMO-REG-0001", website: "https://www.novabyte.example.test", contactEmail: "contact@novabyte.example.test", phone: "+91 00000 00201 (demo)", industry: "Software Products", address: "42 Demo Tech Park, Bengaluru, Karnataka (fictional address)", description: "Fictional demo company. NovaByte Labs builds developer productivity tools for local UI testing.", status: "APPROVED" },
  { email: "company02@example.test", name: "BlueOrbit Technologies", slug: "demo-blueorbit-technologies", registrationNumber: "DEMO-REG-0002", website: "https://www.blueorbit.example.test", contactEmail: "contact@blueorbit.example.test", phone: "+91 00000 00202 (demo)", industry: "Cloud Services", address: "7 Placeholder Avenue, Hyderabad, Telangana (fictional address)", description: "Fictional demo company. BlueOrbit Technologies provides managed cloud platforms in this demo dataset.", status: "APPROVED" },
  { email: "company03@example.test", name: "PixelForge Studio", slug: "demo-pixelforge-studio", registrationNumber: "DEMO-REG-0003", website: "https://www.pixelforge.example.test", contactEmail: "contact@pixelforge.example.test", phone: "+91 00000 00203 (demo)", industry: "Design & Creative", address: "19 Sample Street, Pune, Maharashtra (fictional address)", description: "Fictional demo company. PixelForge Studio is a demo design agency for UI testing.", status: "APPROVED" },
  { email: "company04@example.test", name: "CloudNest Systems", slug: "demo-cloudnest-systems", registrationNumber: "DEMO-REG-0004", website: "https://www.cloudnest.example.test", contactEmail: "contact@cloudnest.example.test", phone: "+91 00000 00204 (demo)", industry: "Cloud Infrastructure", address: "88 Mock Road, Chennai, Tamil Nadu (fictional address)", description: "Fictional demo company. CloudNest Systems runs demo infrastructure services.", status: "APPROVED" },
  { email: "company05@example.test", name: "CodeHarbor Solutions", slug: "demo-codeharbor-solutions", registrationNumber: "DEMO-REG-0005", website: "https://www.codeharbor.example.test", contactEmail: "contact@codeharbor.example.test", phone: "+91 00000 00205 (demo)", industry: "IT Consulting", address: "3 Example Lane, Mysuru, Karnataka (fictional address)", description: "Fictional demo company. CodeHarbor Solutions is awaiting verification in this demo dataset.", status: "PENDING" },
  { email: "company06@example.test", name: "BrightStack Innovations", slug: "demo-brightstack-innovations", registrationNumber: "DEMO-REG-0006", website: "https://www.brightstack.example.test", contactEmail: "contact@brightstack.example.test", phone: "+91 00000 00206 (demo)", industry: "EdTech", address: "56 Demo Campus Road, Bengaluru, Karnataka (fictional address)", description: "Fictional demo company. BrightStack Innovations is awaiting verification in this demo dataset.", status: "PENDING" },
  { email: "company07@example.test", name: "DataSpring Analytics", slug: "demo-dataspring-analytics", registrationNumber: "DEMO-REG-0007", website: "https://www.dataspring.example.test", contactEmail: "contact@dataspring.example.test", phone: "+91 00000 00207 (demo)", industry: "Data & Analytics", address: "12 Fictional Square, Pune, Maharashtra (fictional address)", description: "Fictional demo company. DataSpring Analytics was rejected in this demo dataset.", status: "REJECTED", rejectionReason: "Demo rejection: the submitted registration certificate did not match the provided registration number." },
  { email: "company08@example.test", name: "NextWave Digital", slug: "demo-nextwave-digital", registrationNumber: "DEMO-REG-0008", website: "https://www.nextwave.example.test", contactEmail: "contact@nextwave.example.test", phone: "+91 00000 00208 (demo)", industry: "Digital Marketing", address: "27 Pretend Plaza, Hyderabad, Telangana (fictional address)", description: "Fictional demo company. NextWave Digital was suspended in this demo dataset.", status: "SUSPENDED", rejectionReason: "Demo suspension: repeated policy violations reported against demo job postings." },
];

async function ensureCompany(spec: CompanySpec, passwordHash: string, adminId: string) {
  const ownerId = await ensureUser(spec.email, "COMPANY", passwordHash);
  let company = await prisma.company.findUnique({ where: { ownerId }, select: { id: true, status: true } });
  const isNew = !company;

  if (!company) {
    const slugTaken = await prisma.company.findUnique({ where: { slug: spec.slug }, select: { ownerId: true } });
    if (slugTaken) throw new Error(`Company slug ${spec.slug} already belongs to another company; refusing to modify it.`);
    company = await prisma.company.create({
      data: {
        ownerId, name: spec.name, slug: spec.slug, registrationNumber: spec.registrationNumber,
        website: spec.website, contactEmail: spec.contactEmail, phone: spec.phone, industry: spec.industry,
        address: spec.address, description: spec.description, status: spec.status,
        rejectionReason: spec.rejectionReason ?? null, verificationSubmittedAt: daysFromNow(-20),
      },
      select: { id: true, status: true },
    });
    created.companies++;
  }

  // Registration certificate (metadata + a real demo PDF in local private storage).
  let document = await prisma.verificationDocument.findFirst({ where: { companyId: company.id, type: "REGISTRATION_CERTIFICATE" }, select: { id: true } });
  if (!document) {
    const storageKey = `private/companies/${ownerId}/company-document/demo-registration-certificate.pdf`;
    await putDemoFile(storageKey, demoPdf([
      "DEMO REGISTRATION CERTIFICATE - fictional document for local testing",
      `Company: ${spec.name}`,
      `Registration number: ${spec.registrationNumber}`,
      "This document is generated demo data and has no legal meaning.",
    ]), "application/pdf");
    const docStatus = spec.status === "REJECTED" ? "REJECTED" : spec.status === "PENDING" ? "PENDING" : "VERIFIED";
    document = await prisma.verificationDocument.create({
      data: {
        companyId: company.id, type: "REGISTRATION_CERTIFICATE", storageKey,
        originalName: `${spec.slug}-registration-certificate.pdf`, mimeType: "application/pdf",
        status: docStatus, rejectionReason: spec.status === "REJECTED" ? spec.rejectionReason : null,
      },
      select: { id: true },
    });
    created.documents++;
  }

  // Item reviews so approved companies show fully verified fields/documents,
  // and the rejected company shows a rejected document review.
  if (spec.status === "APPROVED" || spec.status === "SUSPENDED") {
    const fresh = await prisma.company.findUniqueOrThrow({ where: { id: company.id }, select: { updatedAt: true, itemReviews: { select: { field: true, documentId: true, decision: true, createdAt: true } } } });
    for (const field of verificationFields) {
      const current = fresh.itemReviews.filter((r) => r.field === field && r.createdAt >= fresh.updatedAt).some((r) => r.decision === "VERIFIED");
      if (!current) {
        await prisma.companyVerificationItemReview.create({ data: { companyId: company.id, field, decision: "VERIFIED", reviewerId: adminId } });
        created.fieldReviews++;
      }
    }
    const docReviewed = fresh.itemReviews.some((r) => r.documentId === document.id && r.decision === "VERIFIED");
    if (!docReviewed) {
      await prisma.companyVerificationItemReview.create({ data: { companyId: company.id, documentId: document.id, decision: "VERIFIED", reviewerId: adminId } });
      created.documentReviews++;
    }
  }
  if (spec.status === "REJECTED") {
    const existingDocReview = await prisma.companyVerificationItemReview.findFirst({ where: { companyId: company.id, documentId: document.id }, select: { id: true } });
    if (!existingDocReview) {
      await prisma.companyVerificationItemReview.create({ data: { companyId: company.id, documentId: document.id, decision: "REJECTED", reason: spec.rejectionReason, reviewerId: adminId } });
      created.documentReviews++;
    }
  }

  // Audit history (admin review records) matching the final status.
  const decisions: { decision: "APPROVED" | "REJECTED" | "SUSPENDED"; reason?: string }[] =
    spec.status === "APPROVED" ? [{ decision: "APPROVED" }]
    : spec.status === "REJECTED" ? [{ decision: "REJECTED", reason: spec.rejectionReason }]
    : spec.status === "SUSPENDED" ? [{ decision: "APPROVED" }, { decision: "SUSPENDED", reason: spec.rejectionReason }]
    : [];
  for (const entry of decisions) {
    const exists = await prisma.adminReviewRecord.findFirst({ where: { companyId: company.id, decision: entry.decision }, select: { id: true } });
    if (!exists) {
      await prisma.adminReviewRecord.create({ data: { adminId, companyId: company.id, decision: entry.decision, reason: entry.reason ?? null } });
      created.adminReviewRecords++;
    }
  }

  if (!isNew) skipped.push(`company ${spec.name} (already seeded)`);
  return { companyId: company.id, ownerId };
}

// ---------------------------------------------------------------------- jobs

type JobSpec = {
  slug: string; title: string; description: string; location: string | null; workplaceType: WorkplaceType;
  employmentType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT"; experience: string; skills: string[];
  salaryMin: number | null; salaryMax: number | null; deadlineDays: number | null; status: JobStatus;
};

function describeJob(title: string, company: string, skills: string[], experience: string): string {
  return [
    `${company} (a fictional demo company) is hiring a ${title} in this local demo dataset.`,
    "",
    "About the role:",
    `You will work with ${skills.slice(0, 3).join(", ")} on realistic demo projects used purely for UI testing. All details on this page are generated demo data.`,
    "",
    "What we look for:",
    `- ${experience} of relevant experience`,
    ...skills.map((s) => `- Working knowledge of ${s}`),
    "",
    "This posting is fictional and exists only for local development.",
  ].join("\n");
}

// Per-company job sets. Approved companies: 4 published (one of them already
// expired), 1 draft, 1 closed. Other companies: drafts only.
const approvedJobSets: Omit<JobSpec, "description">[][] = [
  [ // NovaByte Labs
    { slug: "demo-nb-frontend-engineer", title: "Frontend Engineer", location: "Bengaluru", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "2-4 years", skills: ["React", "Next.js", "TypeScript", "Git"], salaryMin: 1200000, salaryMax: 1800000, deadlineDays: 30, status: "PUBLISHED" },
    { slug: "demo-nb-backend-developer", title: "Backend Developer (Node.js)", location: "Bengaluru", workplaceType: "ONSITE", employmentType: "FULL_TIME", experience: "3-5 years", skills: ["Node.js", "TypeScript", "MySQL", "AWS"], salaryMin: 1500000, salaryMax: 2200000, deadlineDays: 25, status: "PUBLISHED" },
    { slug: "demo-nb-ui-ux-designer", title: "UI/UX Designer", location: "Remote", workplaceType: "REMOTE", employmentType: "CONTRACT", experience: "2+ years", skills: ["UI/UX", "React"], salaryMin: 800000, salaryMax: 1200000, deadlineDays: 40, status: "PUBLISHED" },
    { slug: "demo-nb-intern-web", title: "Web Development Intern", location: "Bengaluru", workplaceType: "ONSITE", employmentType: "INTERNSHIP", experience: "0-1 years", skills: ["React", "Git"], salaryMin: 240000, salaryMax: 360000, deadlineDays: -5, status: "PUBLISHED" },
    { slug: "demo-nb-platform-architect", title: "Platform Architect", location: "Bengaluru", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "8+ years", skills: ["AWS", "Node.js", "SQL"], salaryMin: 3500000, salaryMax: 4500000, deadlineDays: 45, status: "DRAFT" },
    { slug: "demo-nb-qa-engineer", title: "QA Engineer", location: "Bengaluru", workplaceType: "ONSITE", employmentType: "FULL_TIME", experience: "2-4 years", skills: ["Python", "SQL", "Git"], salaryMin: 900000, salaryMax: 1400000, deadlineDays: null, status: "CLOSED" },
    { slug: "demo-nb-mobile-developer", title: "Mobile Developer", location: "Mysuru", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "2-4 years", skills: ["TypeScript", "React"], salaryMin: 1100000, salaryMax: 1700000, deadlineDays: 33, status: "PUBLISHED" },
    { slug: "demo-nb-tech-writer", title: "Technical Writer", location: "Remote", workplaceType: "REMOTE", employmentType: "PART_TIME", experience: "1-3 years", skills: ["Git"], salaryMin: 500000, salaryMax: 800000, deadlineDays: null, status: "PUBLISHED" },
    { slug: "demo-nb-sdet", title: "Software Engineer in Test", location: "Bengaluru", workplaceType: "ONSITE", employmentType: "FULL_TIME", experience: "3-5 years", skills: ["Python", "TypeScript", "Git"], salaryMin: 1600000, salaryMax: 2200000, deadlineDays: 42, status: "PUBLISHED" },
  ],
  [ // BlueOrbit Technologies
    { slug: "demo-bo-cloud-engineer", title: "Cloud Engineer", location: "Hyderabad", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "3-6 years", skills: ["AWS", "Python", "Git"], salaryMin: 1800000, salaryMax: 2600000, deadlineDays: 35, status: "PUBLISHED" },
    { slug: "demo-bo-data-engineer", title: "Data Engineer", location: "Hyderabad", workplaceType: "ONSITE", employmentType: "FULL_TIME", experience: "2-5 years", skills: ["Python", "SQL", "AWS", "Data analysis"], salaryMin: 1600000, salaryMax: 2400000, deadlineDays: 28, status: "PUBLISHED" },
    { slug: "demo-bo-support-engineer", title: "Technical Support Engineer", location: "Remote", workplaceType: "REMOTE", employmentType: "PART_TIME", experience: "1-3 years", skills: ["SQL", "Git"], salaryMin: 500000, salaryMax: 700000, deadlineDays: 20, status: "PUBLISHED" },
    { slug: "demo-bo-devops-intern", title: "DevOps Intern", location: "Hyderabad", workplaceType: "ONSITE", employmentType: "INTERNSHIP", experience: "0-1 years", skills: ["AWS", "Git"], salaryMin: 240000, salaryMax: 300000, deadlineDays: -3, status: "PUBLISHED" },
    { slug: "demo-bo-sre", title: "Site Reliability Engineer", location: "Hyderabad", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "4-7 years", skills: ["AWS", "Python", "Node.js"], salaryMin: 2400000, salaryMax: 3200000, deadlineDays: 50, status: "DRAFT" },
    { slug: "demo-bo-account-manager", title: "Technical Account Manager", location: "Hyderabad", workplaceType: "ONSITE", employmentType: "FULL_TIME", experience: "5+ years", skills: ["Data analysis"], salaryMin: 1400000, salaryMax: 2000000, deadlineDays: null, status: "CLOSED" },
    { slug: "demo-bo-python-developer", title: "Python Developer", location: "Chennai", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "2-5 years", skills: ["Python", "SQL", "AWS"], salaryMin: 1300000, salaryMax: 1900000, deadlineDays: 31, status: "PUBLISHED" },
    { slug: "demo-bo-security-engineer", title: "Security Engineer", location: "Hyderabad", workplaceType: "ONSITE", employmentType: "FULL_TIME", experience: "4-7 years", skills: ["AWS", "Python"], salaryMin: 2200000, salaryMax: 3000000, deadlineDays: 44, status: "PUBLISHED" },
    { slug: "demo-bo-db-admin", title: "Database Administrator", location: "Remote", workplaceType: "REMOTE", employmentType: "CONTRACT", experience: "5+ years", skills: ["MySQL", "SQL", "AWS"], salaryMin: 1800000, salaryMax: 2500000, deadlineDays: null, status: "PUBLISHED" },
  ],
  [ // PixelForge Studio
    { slug: "demo-pf-product-designer", title: "Product Designer", location: "Pune", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "2-5 years", skills: ["UI/UX"], salaryMin: 1000000, salaryMax: 1600000, deadlineDays: 32, status: "PUBLISHED" },
    { slug: "demo-pf-frontend-developer", title: "Frontend Developer", location: "Pune", workplaceType: "ONSITE", employmentType: "FULL_TIME", experience: "1-3 years", skills: ["React", "TypeScript", "UI/UX"], salaryMin: 800000, salaryMax: 1300000, deadlineDays: 24, status: "PUBLISHED" },
    { slug: "demo-pf-design-intern", title: "Design Intern", location: "Pune", workplaceType: "ONSITE", employmentType: "INTERNSHIP", experience: "0 years", skills: ["UI/UX"], salaryMin: 180000, salaryMax: 240000, deadlineDays: 15, status: "PUBLISHED" },
    { slug: "demo-pf-motion-designer", title: "Motion Designer (Contract)", location: "Remote", workplaceType: "REMOTE", employmentType: "CONTRACT", experience: "3+ years", skills: ["UI/UX"], salaryMin: null, salaryMax: 1500000, deadlineDays: -7, status: "PUBLISHED" },
    { slug: "demo-pf-design-lead", title: "Design Lead", location: "Pune", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "6+ years", skills: ["UI/UX", "Data analysis"], salaryMin: 2200000, salaryMax: 3000000, deadlineDays: 60, status: "DRAFT" },
    { slug: "demo-pf-webflow-developer", title: "Web Developer", location: "Pune", workplaceType: "ONSITE", employmentType: "FULL_TIME", experience: "2-4 years", skills: ["React", "Git"], salaryMin: 900000, salaryMax: 1300000, deadlineDays: null, status: "CLOSED" },
    { slug: "demo-pf-brand-designer", title: "Brand Designer", location: "Mysuru", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "2-4 years", skills: ["UI/UX"], salaryMin: 900000, salaryMax: 1400000, deadlineDays: 36, status: "PUBLISHED" },
    { slug: "demo-pf-ux-researcher", title: "UX Researcher", location: "Remote", workplaceType: "REMOTE", employmentType: "PART_TIME", experience: "2+ years", skills: ["UI/UX", "Data analysis"], salaryMin: 700000, salaryMax: 1000000, deadlineDays: 26, status: "PUBLISHED" },
    { slug: "demo-pf-creative-technologist", title: "Creative Technologist", location: "Pune", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "3-6 years", skills: ["React", "UI/UX", "TypeScript"], salaryMin: 1500000, salaryMax: 2100000, deadlineDays: null, status: "PUBLISHED" },
  ],
  [ // CloudNest Systems
    { slug: "demo-cn-java-developer", title: "Java Developer", location: "Chennai", workplaceType: "ONSITE", employmentType: "FULL_TIME", experience: "3-6 years", skills: ["Java", "SQL", "MySQL"], salaryMin: 1400000, salaryMax: 2000000, deadlineDays: 38, status: "PUBLISHED" },
    { slug: "demo-cn-fullstack-developer", title: "Full-stack Developer", location: "Chennai", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "2-5 years", skills: ["React", "Node.js", "MySQL", "Git"], salaryMin: 1300000, salaryMax: 1900000, deadlineDays: 27, status: "PUBLISHED" },
    { slug: "demo-cn-data-analyst", title: "Data Analyst", location: "Remote", workplaceType: "REMOTE", employmentType: "FULL_TIME", experience: "1-3 years", skills: ["SQL", "Python", "Data analysis"], salaryMin: 700000, salaryMax: 1100000, deadlineDays: 22, status: "PUBLISHED" },
    { slug: "demo-cn-infra-contract", title: "Infrastructure Engineer (Contract)", location: "Chennai", workplaceType: "ONSITE", employmentType: "CONTRACT", experience: "4+ years", skills: ["AWS", "Python"], salaryMin: 2000000, salaryMax: null, deadlineDays: -2, status: "PUBLISHED" },
    { slug: "demo-cn-engineering-manager", title: "Engineering Manager", location: "Chennai", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "8+ years", skills: ["Java", "Node.js", "AWS"], salaryMin: 3800000, salaryMax: 5000000, deadlineDays: 55, status: "DRAFT" },
    { slug: "demo-cn-support-analyst", title: "Support Analyst", location: "Chennai", workplaceType: "ONSITE", employmentType: "PART_TIME", experience: "1-2 years", skills: ["SQL"], salaryMin: 400000, salaryMax: 600000, deadlineDays: null, status: "CLOSED" },
    { slug: "demo-cn-backend-java-senior", title: "Senior Java Engineer", location: "Chennai", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "5-8 years", skills: ["Java", "MySQL", "AWS"], salaryMin: 2400000, salaryMax: 3200000, deadlineDays: 39, status: "PUBLISHED" },
    { slug: "demo-cn-node-intern", title: "Node.js Intern", location: "Chennai", workplaceType: "ONSITE", employmentType: "INTERNSHIP", experience: "0-1 years", skills: ["Node.js", "Git"], salaryMin: 200000, salaryMax: 280000, deadlineDays: 18, status: "PUBLISHED" },
    { slug: "demo-cn-solutions-architect", title: "Solutions Architect", location: "Remote", workplaceType: "REMOTE", employmentType: "FULL_TIME", experience: "7+ years", skills: ["AWS", "Java", "Node.js"], salaryMin: 3200000, salaryMax: 4200000, deadlineDays: null, status: "PUBLISHED" },
  ],
];

const draftOnlyJobSets: Omit<JobSpec, "description">[][] = [
  [ // CodeHarbor Solutions (PENDING)
    { slug: "demo-ch-consultant", title: "Technology Consultant", location: "Mysuru", workplaceType: "ONSITE", employmentType: "FULL_TIME", experience: "3-6 years", skills: ["Java", "SQL"], salaryMin: 1200000, salaryMax: 1800000, deadlineDays: 30, status: "DRAFT" },
    { slug: "demo-ch-analyst", title: "Business Analyst", location: "Mysuru", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "2-4 years", skills: ["Data analysis", "SQL"], salaryMin: 900000, salaryMax: 1400000, deadlineDays: 25, status: "DRAFT" },
  ],
  [ // BrightStack Innovations (PENDING)
    { slug: "demo-bs-react-developer", title: "React Developer", location: "Bengaluru", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "2-4 years", skills: ["React", "TypeScript"], salaryMin: 1100000, salaryMax: 1600000, deadlineDays: 30, status: "DRAFT" },
    { slug: "demo-bs-content-engineer", title: "Content Platform Engineer", location: "Bengaluru", workplaceType: "ONSITE", employmentType: "FULL_TIME", experience: "3-5 years", skills: ["Node.js", "MySQL"], salaryMin: 1400000, salaryMax: 2000000, deadlineDays: 35, status: "DRAFT" },
  ],
  [ // DataSpring Analytics (REJECTED)
    { slug: "demo-ds-data-scientist", title: "Data Scientist", location: "Pune", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "3-6 years", skills: ["Python", "SQL", "Data analysis"], salaryMin: 1800000, salaryMax: 2600000, deadlineDays: 30, status: "DRAFT" },
    { slug: "demo-ds-bi-developer", title: "BI Developer", location: "Pune", workplaceType: "ONSITE", employmentType: "FULL_TIME", experience: "2-4 years", skills: ["SQL", "Data analysis"], salaryMin: 1000000, salaryMax: 1500000, deadlineDays: 25, status: "DRAFT" },
  ],
  [ // NextWave Digital (SUSPENDED)
    { slug: "demo-nw-marketing-engineer", title: "Marketing Automation Engineer", location: "Hyderabad", workplaceType: "HYBRID", employmentType: "FULL_TIME", experience: "2-5 years", skills: ["Node.js", "SQL"], salaryMin: 1200000, salaryMax: 1700000, deadlineDays: 30, status: "DRAFT" },
    { slug: "demo-nw-seo-analyst", title: "SEO Analyst", location: "Hyderabad", workplaceType: "ONSITE", employmentType: "PART_TIME", experience: "1-3 years", skills: ["Data analysis"], salaryMin: 400000, salaryMax: 600000, deadlineDays: 25, status: "DRAFT" },
  ],
];

async function ensureJob(companyId: string, companyName: string, spec: Omit<JobSpec, "description">) {
  const existing = await prisma.job.findUnique({ where: { slug: spec.slug }, select: { id: true, companyId: true, status: true } });
  if (existing) {
    if (existing.companyId !== companyId) throw new Error(`Job slug ${spec.slug} belongs to another company; refusing to modify it.`);
    return existing;
  }
  const publishedish = spec.status === "PUBLISHED" || spec.status === "CLOSED";
  const job = await prisma.job.create({
    data: {
      companyId, title: spec.title, slug: spec.slug,
      description: describeJob(spec.title, companyName, spec.skills, spec.experience),
      location: spec.location, workplaceType: spec.workplaceType, employmentType: spec.employmentType,
      experienceRequirement: spec.experience, requiredSkills: spec.skills,
      salaryMin: spec.salaryMin, salaryMax: spec.salaryMax,
      applicationDeadline: spec.deadlineDays !== null ? daysFromNow(spec.deadlineDays) : null,
      status: spec.status, publishedAt: publishedish ? daysFromNow(-15 - (spec.slug.length % 10)) : null,
    },
    select: { id: true, companyId: true, status: true },
  });
  created.jobs++;
  return job;
}

// -------------------------------------------------------------- applications

const statusChains: Record<Exclude<ApplicationStatus, "WITHDRAWN">, ApplicationStatus[]> = {
  APPLIED: ["APPLIED"],
  REVIEWING: ["APPLIED", "REVIEWING"],
  SHORTLISTED: ["APPLIED", "REVIEWING", "SHORTLISTED"],
  HIRED: ["APPLIED", "REVIEWING", "SHORTLISTED", "HIRED"],
  REJECTED: ["APPLIED", "REVIEWING", "REJECTED"],
};

// Deterministic status cycle guaranteeing: 3+ hired, 5+ shortlisted, 10+ rejected, many reviewing.
const statusCycle: Exclude<ApplicationStatus, "WITHDRAWN">[] = [
  "APPLIED", "REVIEWING", "REJECTED", "APPLIED", "SHORTLISTED", "REJECTED", "REVIEWING", "APPLIED",
  "REJECTED", "HIRED", "APPLIED", "REVIEWING", "REJECTED", "SHORTLISTED", "APPLIED", "REJECTED",
];

const coverNotes = [
  "Hello! This is a demo cover letter. I have worked with this stack for several years and would love to discuss the role.",
  "Demo application note: my recent projects match the required skills closely, and I am available to start within a month.",
  null,
  "This is seeded demo text. I am excited about this fictional opportunity and believe my experience is a strong fit.",
  null,
];

async function ensureApplication(
  jobId: string, candidateId: string, candidateResumeKey: string | null, companyOwnerId: string,
  finalStatus: Exclude<ApplicationStatus, "WITHDRAWN">, appliedDaysAgo: number, coverNote: string | null,
) {
  const existing = await prisma.application.findUnique({ where: { jobId_candidateId: { jobId, candidateId } }, select: { id: true } });
  if (existing) return;
  const chain = statusChains[finalStatus];
  const appliedAt = daysFromNow(-appliedDaysAgo);
  await prisma.application.create({
    data: {
      jobId, candidateId, coverNote, resumeKey: candidateResumeKey, status: finalStatus, createdAt: appliedAt,
      statusHistory: {
        create: chain.map((status, index) => ({
          status,
          actorId: index === 0 ? candidateId : companyOwnerId,
          createdAt: new Date(appliedAt.getTime() + index * 2 * day),
        })),
      },
    },
  });
  created.applications++;
  created.statusHistory += chain.length;
}

// ---------------------------------------------------------------------- main

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("db:seed:demo is for local development only and refuses to run with NODE_ENV=production.");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Run through `npm run db:seed:demo`, which loads .env.local.");
  }

  console.log("Seeding Jobs Territory demo data (local development only)…");
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const adminId = await ensureUser(ADMIN_EMAIL, "ADMIN", passwordHash);

  // Candidates
  const candidates: { userId: string; resumeKey: string | null }[] = [];
  for (const spec of candidateSpecs) {
    const userId = await ensureCandidate(spec, passwordHash);
    const profile = await prisma.candidateProfile.findUnique({ where: { userId }, select: { resumeKey: true } });
    candidates.push({ userId, resumeKey: profile?.resumeKey ?? null });
  }

  // Companies + jobs
  const openPublishedJobs: { id: string; ownerId: string }[] = [];
  let approvedIndex = 0;
  let draftIndex = 0;
  for (const spec of companySpecs) {
    const { companyId, ownerId } = await ensureCompany(spec, passwordHash, adminId);
    const jobSet = spec.status === "APPROVED" ? approvedJobSets[approvedIndex++] : draftOnlyJobSets[draftIndex++];
    for (const jobSpec of jobSet ?? []) {
      const job = await ensureJob(companyId, spec.name, jobSpec);
      if (job.status === "PUBLISHED" && (jobSpec.deadlineDays === null || jobSpec.deadlineDays > 0)) {
        openPublishedJobs.push({ id: job.id, ownerId });
      }
    }
  }

  // Applications: each candidate applies to several open published jobs, rotated
  // deterministically so some jobs get many applicants and the last job gets one.
  if (openPublishedJobs.length > 0) {
    const rotationJobs = openPublishedJobs.slice(0, Math.max(1, openPublishedJobs.length - 1));
    const lastJob = openPublishedJobs[openPublishedJobs.length - 1]!;
    let statusIndex = 0;
    for (let c = 0; c < candidates.length; c++) {
      const candidate = candidates[c]!;
      const applicationCount = 3 + (c % 4); // 3–6 applications per candidate
      for (let k = 0; k < applicationCount; k++) {
        const job = rotationJobs[(c + k * 3) % rotationJobs.length]!;
        await ensureApplication(
          job.id, candidate.userId, candidate.resumeKey, job.ownerId,
          statusCycle[statusIndex % statusCycle.length]!, 28 - ((c * 2 + k * 3) % 26),
          coverNotes[(c + k) % coverNotes.length] ?? null,
        );
        statusIndex++;
      }
    }
    // Exactly one applicant for the final published job.
    const solo = candidates[0]!;
    await ensureApplication(lastJob.id, solo.userId, solo.resumeKey, lastJob.ownerId, "APPLIED", 2, coverNotes[0] ?? null);
  }

  console.log("\nDemo seed complete. Records created this run:");
  for (const [model, count] of Object.entries(created)) console.log(`  ${model}: ${count}`);
  if (skipped.length > 0) {
    console.log(`\nSkipped (already present or unavailable): ${skipped.length}`);
    for (const item of skipped) console.log(`  - ${item}`);
  }
  console.log("\nDemo credentials are documented in docs/demo-data.md (local development only).");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Demo seed failed.");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
