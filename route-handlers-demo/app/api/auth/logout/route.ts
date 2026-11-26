import { NextResponse } from "next/server";
import { checkOrigin, fail, logError } from "../../../../lib/security/http";
import { SESSION_COOKIE, sessionCookieOptions } from "../../../../lib/security/session";

export async function POST(request: Request) {
    try {
        const originError = checkOrigin(request);
        if (originError) {
            return originError;
        }

        const response = NextResponse.json({ ok: true });
        response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
        return response;
    } catch (err) {
        logError("logout", err);
        return fail(500, "Internal Server Error");
    }
}
