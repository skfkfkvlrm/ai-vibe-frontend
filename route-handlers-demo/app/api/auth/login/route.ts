import { NextResponse } from "next/server";
import { checkOrigin, clientIp, fail, logError } from "../../../../lib/security/http";
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS, sessionCookieOptions } from "../../../../lib/security/session";
import { verifyAdminCredentials } from "../../../../lib/security/auth";
import { rateLimit } from "../../../../lib/security/rate-limit";
import { parseJsonBody } from "../../../../lib/security/validate";

export async function POST(request: Request) {
    try {
        const originError = checkOrigin(request);
        if (originError) {
            return originError;
        }

        const limit = rateLimit("login:" + clientIp(request), 5, 60000);
        if (!limit.ok) {
            return fail(429, "Too Many Requests", { "Retry-After": String(limit.retryAfter) });
        }

        const parsed = await parseJsonBody(request);
        if (!parsed.ok) {
            return parsed.response;
        }

        const data = parsed.data;
        if (
            typeof data !== "object" ||
            data === null ||
            !("id" in data) ||
            !("password" in data) ||
            typeof data.id !== "string" ||
            typeof data.password !== "string" ||
            data.id.length > 200 ||
            data.password.length > 200
        ) {
            return fail(400, "Bad Request");
        }

        if (!verifyAdminCredentials(data.id, data.password)) {
            return fail(401, "Invalid credentials");
        }

        const token = createSessionToken();
        if (token === null) {
            return fail(503, "Service Unavailable");
        }

        const response = NextResponse.json({ ok: true });
        response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_TTL_SECONDS));
        return response;
    } catch (err) {
        logError("login", err);
        return fail(500, "Internal Server Error");
    }
}
