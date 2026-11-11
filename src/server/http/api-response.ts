export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return Response.json({ data }, init);
}

export function apiMessage(message: string, init?: ResponseInit) {
  return Response.json({ data: { message } }, init);
}
