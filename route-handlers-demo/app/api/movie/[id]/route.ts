import { movie } from "../data";
import { requireAdmin } from "../../../../lib/security/auth";
import { checkOrigin, clientIp, fail, logError } from "../../../../lib/security/http";
import { rateLimit } from "../../../../lib/security/rate-limit";
import { parseJsonBody, validateMovie } from "../../../../lib/security/validate";

type Params = { params: Promise<{ id: string }> };

function parseId(id: string): number | null {
    return /^\d{1,9}$/.test(id) ? parseInt(id, 10) : null;
}

// 쓰기 요청 공통 방어: 호출 제한 -> Origin -> 관리자 세션 순서
function guardWrite(request: Request): Response | null {
    const limited = rateLimit(`movie-write:${clientIp(request)}`, 30, 60_000);
    if (!limited.ok) return fail(429, "Too Many Requests", { "Retry-After": String(limited.retryAfter) });
    return checkOrigin(request) ?? requireAdmin(request);
}

export async function GET(_request: Request, { params }: Params) {
    try {
        const id = parseId((await params).id);
        if (id === null) return fail(400, "Bad Request");
        const found = movie.find((m) => m.id === id);
        if (!found) return fail(404, "Not found");
        return Response.json(found);
    } catch (err) {
        logError("movie.id.GET", err);
        return fail(500, "Internal Server Error");
    }
}

export async function PUT(request: Request, { params }: Params) {
    try {
        const blocked = guardWrite(request);
        if (blocked) return blocked;

        const id = parseId((await params).id);
        if (id === null) return fail(400, "Bad Request");
        const index = movie.findIndex((m) => m.id === id);
        if (index === -1) return fail(404, "Not found");

        const body = await parseJsonBody(request);
        if (!body.ok) return body.response;
        const checked = validateMovie(body.data, { partial: true });
        if (!checked.ok) return fail(400, checked.error);

        // 검증된 허용 필드만 반영하므로 id 등은 바뀌지 않는다
        Object.assign(movie[index], checked.value);
        return Response.json(movie[index]);
    } catch (err) {
        logError("movie.id.PUT", err);
        return fail(500, "Internal Server Error");
    }
}

export async function DELETE(request: Request, { params }: Params) {
    try {
        const blocked = guardWrite(request);
        if (blocked) return blocked;

        const id = parseId((await params).id);
        if (id === null) return fail(400, "Bad Request");
        const index = movie.findIndex((m) => m.id === id);
        if (index === -1) return fail(404, "Not found");

        const [deleted] = movie.splice(index, 1);
        return Response.json(deleted);
    } catch (err) {
        logError("movie.id.DELETE", err);
        return fail(500, "Internal Server Error");
    }
}
