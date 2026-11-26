import type { Destination } from "./data";

export type DestinationInput = Omit<Destination, "id">;
type Result =
  | { ok: true; value: DestinationInput }
  | { ok: false; error: string };

const ALLOWED_KEYS = new Set(["name", "sea", "eat", "picture"]);
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

export function parseInput(body: unknown): Result {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "잘못된 요청 형식입니다." };
  }
  const obj = body as Record<string, unknown>;
  for (const k of Object.keys(obj)) {
    if (!ALLOWED_KEYS.has(k)) {
      return { ok: false, error: `허용되지 않은 필드: ${k}` };
    }
  }
  const name = text(obj.name, 30);
  const sea = text(obj.sea, 200);
  const eat = text(obj.eat, 200);
  const picture = typeof obj.picture === "string" ? obj.picture.trim() : "";
  if (!name) return { ok: false, error: "여행지명은 1~30자여야 합니다." };
  if (!sea) return { ok: false, error: "볼거리는 1~200자여야 합니다." };
  if (!eat) return { ok: false, error: "먹거리는 1~200자여야 합니다." };
  if (!PICTURE_RE.test(picture)) {
    return {
      ok: false,
      error: "사진은 /images/파일명.jpg(png, webp) 형식이어야 합니다.",
    };
  }
  return { ok: true, value: { name, sea, eat, picture } };
}

/** 경로의 id를 엄격하게 파싱한다. 잘못되면 null. */
export function parseId(raw: string): number | null {
  if (!/^[1-9]\d{0,8}$/.test(raw)) return null;
  return Number(raw);
}
