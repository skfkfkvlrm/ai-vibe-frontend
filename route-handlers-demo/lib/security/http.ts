export function fail(status: number, message: string, headers?: HeadersInit): Response {
  return Response.json({ error: message }, { status, headers })
}
export function checkOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin")
  if (!origin) return null
  try { if (new URL(request.url).host !== new URL(origin).host) return fail(403, "Forbidden") } catch { return fail(403, "Forbidden") }
  return null
}
export function clientIp(request: Request): string {
  // 신뢰하는 프록시 뒤(TRUST_PROXY=1)에서만 헤더를 사용한다. 기본값은 위조 불가능한 공용 키다.
  if (process.env.TRUST_PROXY !== "1") return "shared"
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") || "unknown"
}
export function logError(context: string, err: unknown): void {
  console.error("[security]", context, err instanceof Error ? err.name + ": " + err.message : "unknown error")
}
