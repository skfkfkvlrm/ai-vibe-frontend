import { fail } from "./http"
export type MovieInput = { title: string; director: string; actor: string; count: string; releaseDate: string; country: string; company: string; poster: string }
const fields: (keyof MovieInput)[] = ["title", "director", "actor", "count", "releaseDate", "country", "company", "poster"]
export async function parseJsonBody(request: Request, maxBytes = 10000): Promise<{ ok: true; data: unknown } | { ok: false; response: Response }> {
  if (!(request.headers.get("content-type") || "").startsWith("application/json")) return { ok: false, response: fail(415, "Unsupported Media Type") }
  const length = request.headers.get("content-length")
  if (length && Number(length) > maxBytes) return { ok: false, response: fail(413, "Payload Too Large") }
  try { const text = await request.text(); if (text.length > maxBytes) return { ok: false, response: fail(413, "Payload Too Large") }; return { ok: true, data: JSON.parse(text) as unknown } } catch { return { ok: false, response: fail(400, "Invalid JSON") }
  }
}
export function validateMovie(input: unknown, opts: { partial: boolean }): { ok: true; value: Partial<MovieInput> } | { ok: false; error: string } {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return { ok: false, error: "invalid object" }
  const record = input as Record<string, unknown>
  for (const key of Object.keys(record)) if (!fields.includes(key as keyof MovieInput)) return { ok: false, error: `unknown field: ${key.slice(0, 30)}` }
  if (opts.partial && Object.keys(record).length === 0) return { ok: false, error: "no fields" }
  const value: Partial<MovieInput> = {}
  for (const field of fields) { if (!(field in record)) continue; if (typeof record[field] !== "string") return { ok: false, error: `invalid ${field}` }; value[field] = record[field].trim().replace(/[\u0000-\u001f\u007f]/g, "") }
  if (!opts.partial && (value.title === undefined || value.director === undefined)) return { ok: false, error: "missing required field" }
  if (value.title !== undefined && (value.title.length < 1 || value.title.length > 100)) return { ok: false, error: "invalid title" }
  if (value.director !== undefined && (value.director.length < 1 || value.director.length > 100)) return { ok: false, error: "invalid director" }
  for (const field of ["actor", "company", "country"] as const) if (value[field] !== undefined && value[field].length > 200) return { ok: false, error: `invalid ${field}` }
  if (value.count !== undefined && value.count !== "" && !/^\d{1,3}(,\d{3})*$/.test(value.count)) return { ok: false, error: "invalid count" }
  if (value.releaseDate !== undefined && value.releaseDate !== "") { if (!/^\d{4}-\d{2}-\d{2}$/.test(value.releaseDate)) return { ok: false, error: "invalid releaseDate" }; const date = new Date(`${value.releaseDate}T00:00:00Z`); if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value.releaseDate) return { ok: false, error: "invalid releaseDate" } }
  if (value.poster !== undefined && value.poster !== "" && !/^\/image\/\d+\.webp$/.test(value.poster)) return { ok: false, error: "invalid poster" }
  if (!opts.partial) for (const field of fields) if (!(field in value)) value[field] = ""
  return { ok: true, value }
}
