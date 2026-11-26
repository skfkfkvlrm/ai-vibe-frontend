import { createHash, timingSafeEqual } from "node:crypto"
import { fail } from "./http"
import { SESSION_COOKIE, verifySessionToken } from "./session"
export function verifyAdminCredentials(id: unknown, password: unknown): boolean {
  const adminId = process.env.ADMIN_ID, adminPassword = process.env.ADMIN_PASSWORD
  if (typeof id !== "string" || typeof password !== "string" || !adminId || !adminPassword) return false
  const idMatch = timingSafeEqual(createHash("sha256").update(id).digest(), createHash("sha256").update(adminId).digest())
  const passwordMatch = timingSafeEqual(createHash("sha256").update(password).digest(), createHash("sha256").update(adminPassword).digest())
  return idMatch && passwordMatch
}
export function requireAdmin(request: Request): Response | null {
  const cookie = request.headers.get("cookie") || ""
  let token: string | undefined
  for (const item of cookie.split(";")) {
    const separator = item.indexOf("=")
    if (separator < 0 || item.slice(0, separator).trim() !== SESSION_COOKIE) continue
    try { token = decodeURIComponent(item.slice(separator + 1).trim()) } catch { token = item.slice(separator + 1).trim() }
    break
  }
  return verifySessionToken(token) ? null : fail(401, "Unauthorized")
}
