const entries = new Map<string, { count: number; resetAt: number }>()
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now(); let removed = 0
  for (const [entryKey, entry] of entries) if (entry.resetAt <= now && removed < 100) { entries.delete(entryKey); removed++ }
  const current = entries.get(key)
  if (!current || current.resetAt <= now) {
    // 키 개수 상한(메모리 보호): 가득 차면 가장 오래된 항목부터 제거
    if (entries.size >= 5000) { const oldest = entries.keys().next().value; if (oldest !== undefined) entries.delete(oldest) }
    entries.set(key, { count: 1, resetAt: now + windowMs }); return { ok: true, retryAfter: 0 }
  }
  current.count++
  if (current.count > limit) return { ok: false, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) }
  return { ok: true, retryAfter: 0 }
}
