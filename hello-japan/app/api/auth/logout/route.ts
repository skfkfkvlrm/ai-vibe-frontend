import type { NextRequest } from "next/server";
import { SESSION_COOKIE, isSameOrigin, json } from "../../_lib/auth";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return json({ error: "허용되지 않은 요청입니다." }, 403);
  const res = json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
