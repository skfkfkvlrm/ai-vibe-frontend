import { createHmac, timingSafeEqual } from "node:crypto"
export const SESSION_COOKIE = "session"
export const SESSION_TTL_SECONDS = 3600
export function createSessionToken(): string | null {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) return null
  const payload = Buffer.from(JSON.stringify({ sub: "admin", exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })).toString("base64url")
  return `${payload}.${createHmac("sha256", secret).update(payload).digest().toString("base64url")}`
}
export function verifySessionToken(token: string | undefined | null): boolean {
  try {
    const secret = process.env.SESSION_SECRET
    if (!secret || secret.length < 32 || !token) return false
    const parts = token.split(".")
    if (parts.length !== 2 || !parts[0] || !parts[1]) return false
    const expected = createHmac("sha256", secret).update(parts[0]).digest()
    const actual = Buffer.from(parts[1], "base64url")
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")) as { sub?: unknown; exp?: unknown }
    return payload.sub === "admin" && typeof payload.exp === "number" && payload.exp > Math.floor(Date.now() / 1000)
  } catch { return false }
}
export function sessionCookieOptions(maxAge: number) {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge }
}
