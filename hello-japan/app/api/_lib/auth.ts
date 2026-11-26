import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "hj_session";
export const SESSION_TTL_SEC = 2 * 60 * 60; // 2시간

function secret(): string {
  const s = process.env.SESSION_SECRET;
  // 설정이 없거나 약하면 실패(fail closed)
  if (!s || s.length < 32) throw new Error("SESSION_SECRET is not configured");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_TTL_SEC * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  try {
    const expected = Buffer.from(sign(payload));
    const actual = Buffer.from(sig);
    if (expected.length !== actual.length) return false;
    if (!timingSafeEqual(expected, actual)) return false;
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export function isAdmin(req: NextRequest): boolean {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

/** 비밀번호를 상수 시간으로 비교한다(해시로 길이를 맞춘 뒤 비교). */
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/** CSRF 방어: 변경 요청의 Origin 호스트가 요청 Host와 같아야 한다. */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/** 변경(POST/PUT/DELETE) 요청 가드. 통과하면 null, 아니면 오류 응답. */
export function guardWrite(req: NextRequest): NextResponse | null {
  if (!isSameOrigin(req)) return json({ error: "허용되지 않은 요청입니다." }, 403);
  if (!isAdmin(req)) return json({ error: "로그인이 필요합니다." }, 401);
  return null;
}

const MAX_BODY = 8 * 1024;

/** JSON 본문을 안전하게 읽는다(타입·크기 제한). 실패 시 undefined. */
export async function readJson(req: NextRequest): Promise<unknown | undefined> {
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) {
    return undefined;
  }
  const text = await req.text();
  if (text.length > MAX_BODY) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
