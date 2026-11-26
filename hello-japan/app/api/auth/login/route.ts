import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_SEC,
  checkPassword,
  createSessionToken,
  isSameOrigin,
  json,
  readJson,
} from "../../_lib/auth";

// 로그인 무차별 대입 완화: IP별 실패 횟수 제한(메모리, 단일 인스턴스 기준)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILS = 5;
const fails = new Map<string, { count: number; first: number }>();

function clientKey(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

function blocked(key: string): boolean {
  const f = fails.get(key);
  if (!f) return false;
  if (Date.now() - f.first > WINDOW_MS) {
    fails.delete(key);
    return false;
  }
  return f.count >= MAX_FAILS;
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return json({ error: "forbidden" }, 403);

  const key = clientKey(req);
  if (blocked(key)) {
    return json({ error: "too_many" }, 429);
  }

  const body = await readJson(req);
  const password =
    typeof body === "object" && body !== null && "password" in body
      ? (body as { password: unknown }).password
      : undefined;

  if (typeof password !== "string" || password.length > 200 || !checkPassword(password)) {
    const f = fails.get(key);
    fails.set(key, f ? { ...f, count: f.count + 1 } : { count: 1, first: Date.now() });
    await new Promise((r) => setTimeout(r, 400));
    return json({ error: "auth_failed" }, 401);
  }

  fails.delete(key);
  try {
    const res = json({ ok: true });
    res.cookies.set(SESSION_COOKIE, createSessionToken(), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_SEC,
    });
    return res;
  } catch {
    // 서버 설정 오류 — 상세 내용은 노출하지 않는다.
    return json({ error: "server_config" }, 500);
  }
}
