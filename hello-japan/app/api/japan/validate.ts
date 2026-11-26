import type {
  Destination,
  Translation,
  TranslationLocale,
} from "./data";

export type DestinationInput = Omit<Destination, "id">;
type Translations = NonNullable<Destination["i18n"]>;
type Result =
  | { ok: true; value: DestinationInput }
  | { ok: false; error: string };

export const TR_LOCALES: readonly TranslationLocale[] = ["en", "ja", "zh"];
const TR_FIELDS = ["name", "sea", "eat"] as const;
const MAX = { name: 30, sea: 200, eat: 200 } as const;

const ALLOWED_KEYS = new Set(["name", "sea", "eat", "picture", "i18n"]);
// 사진은 public/images 아래 로컬 이미지 경로만 허용(외부 URL·경로 이탈 차단)
const PICTURE_RE = /^\/images\/[A-Za-z0-9_-]{1,64}\.(jpg|jpeg|png|webp)$/;

function text(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (t.length < 1 || t.length > max) return null;
  // 제어 문자 금지
  if (/[\u0000-\u001f\u007f]/.test(t)) return null;
  return t;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * 번역 객체 검증.
 * - 허용 언어/필드 외의 키는 거부
 * - strict=true : 모든 언어·모든 필드가 유효해야 한다(자동 번역 결과 검증용)
 * - strict=false: 빈 문자열/누락은 건너뛴다(관리자 입력용)
 */
export function parseTranslations(
  raw: unknown,
  strict: boolean,
): Translations | null {
  if (raw === undefined) return strict ? null : {};
  if (!isPlainObject(raw)) return null;

  const out: Translations = {};
  for (const key of Object.keys(raw)) {
    if (!(TR_LOCALES as readonly string[]).includes(key)) return null;
  }
  for (const loc of TR_LOCALES) {
    const entry = raw[loc];
    if (entry === undefined) {
      if (strict) return null;
      continue;
    }
    if (!isPlainObject(entry)) return null;
    for (const k of Object.keys(entry)) {
      if (!(TR_FIELDS as readonly string[]).includes(k)) return null;
    }
    const tr: Translation = {};
    for (const f of TR_FIELDS) {
      const v = entry[f];
      if (v === undefined || v === "") {
        if (strict) return null;
        continue;
      }
      const t = text(v, MAX[f]);
      if (t === null) return null;
      tr[f] = t;
    }
    if (Object.keys(tr).length > 0) out[loc] = tr;
  }
  return out;
}

/** 한국어 기본 필드(name, sea, eat) 검증. 실패 시 오류 코드. */
function parseBase(
  obj: Record<string, unknown>,
): { name: string; sea: string; eat: string } | string {
  const name = text(obj.name, MAX.name);
  const sea = text(obj.sea, MAX.sea);
  const eat = text(obj.eat, MAX.eat);
  if (!name) return "bad_name";
  if (!sea) return "bad_sea";
  if (!eat) return "bad_eat";
  return { name, sea, eat };
}

export function parseInput(body: unknown): Result {
  if (!isPlainObject(body)) return { ok: false, error: "bad_request" };
  for (const k of Object.keys(body)) {
    if (!ALLOWED_KEYS.has(k)) return { ok: false, error: "bad_key" };
  }
  const base = parseBase(body);
  if (typeof base === "string") return { ok: false, error: base };

  const picture = typeof body.picture === "string" ? body.picture.trim() : "";
  if (!PICTURE_RE.test(picture)) return { ok: false, error: "bad_picture" };

  const i18n = parseTranslations(body.i18n, false);
  if (i18n === null) return { ok: false, error: "bad_i18n" };

  const value: DestinationInput = { ...base, picture };
  if (Object.keys(i18n).length > 0) value.i18n = i18n;
  return { ok: true, value };
}

/** 자동 번역 요청 본문(한국어 name/sea/eat만 허용) 검증 */
export function parseTranslateSource(
  body: unknown,
): { ok: true; value: { name: string; sea: string; eat: string } } | { ok: false; error: string } {
  if (!isPlainObject(body)) return { ok: false, error: "bad_request" };
  for (const k of Object.keys(body)) {
    if (!(TR_FIELDS as readonly string[]).includes(k)) {
      return { ok: false, error: "bad_key" };
    }
  }
  const base = parseBase(body);
  return typeof base === "string"
    ? { ok: false, error: base }
    : { ok: true, value: base };
}

/** 경로의 id를 엄격하게 파싱한다. 잘못되면 null. */
export function parseId(raw: string): number | null {
  if (!/^[1-9]\d{0,8}$/.test(raw)) return null;
  return Number(raw);
}
