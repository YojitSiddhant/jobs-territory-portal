export function normalizeAdminEmail(email: string) { return email.trim().toLowerCase(); }

export function canPromoteExistingUser(role: string, explicitlyConfirmed: boolean) {
  return role === "ADMIN" || explicitlyConfirmed;
}
