import { requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { createPrivateObjectKey, getPrivateStorage, validateUpload } from "@/server/storage/private-storage";

export async function POST(request: Request) {
  try {
    const user = await requireRole("CANDIDATE");
    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind");
    if (!(file instanceof File) || (kind !== "profile-photo" && kind !== "resume")) return Response.json({ error: { code: "INVALID_UPLOAD", message: "Provide a file and kind (profile-photo or resume)." } }, { status: 400 });
    validateUpload(file, kind);
    const key = createPrivateObjectKey(user.id, kind, file.name);
    await getPrivateStorage().put({ key, contentType: file.type, sizeBytes: file.size, body: new Uint8Array(await file.arrayBuffer()) });
    const profile = await prisma.candidateProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, ...(kind === "resume" ? { resumeKey: key } : { profilePhotoKey: key }) }, update: kind === "resume" ? { resumeKey: key } : { profilePhotoKey: key }, select: { profilePhotoKey: true, resumeKey: true } });
    return apiSuccess({ key, kind, profilePhotoKey: profile.profilePhotoKey, resumeKey: profile.resumeKey }, { status: 201 });
  } catch (error) { return apiError(error); }
}
