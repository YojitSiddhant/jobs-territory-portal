export async function POST() {
  return Response.json({ error: { code: "DEPRECATED_DOCUMENT_FLOW", message: "Upload a document using the multipart upload endpoint." } }, { status: 410 });
}
