import { NextRequest } from "next/server";
import { movie } from "./data";
import { requireAdmin } from "../../../lib/security/auth";
import { checkOrigin, clientIp, fail, logError } from "../../../lib/security/http";
import { rateLimit } from "../../../lib/security/rate-limit";
import { parseJsonBody, validateMovie } from "../../../lib/security/validate";

export async function GET(request: NextRequest) {
    try {
        const query = request.nextUrl.searchParams.get("query");
        if (query && query.length > 100) return fail(400, "Bad Request");
        const filteredMovies = query ? movie.filter(
            (m) => m.title.includes(query) || m.director.includes(query) || m.actor.includes(query)) : movie;
        return Response.json(filteredMovies);
    } catch (err) {
        logError("movie.GET", err);
        return fail(500, "Internal Server Error");
    }
}

export async function POST(request: Request) {
    try {
        const limited = rateLimit(`movie-write:${clientIp(request)}`, 30, 60_000);
        if (!limited.ok) return fail(429, "Too Many Requests", { "Retry-After": String(limited.retryAfter) });
        const blocked = checkOrigin(request) ?? requireAdmin(request);
        if (blocked) return blocked;

        const body = await parseJsonBody(request);
        if (!body.ok) return body.response;
        const checked = validateMovie(body.data, { partial: false });
        if (!checked.ok) return fail(400, checked.error);

        const v = checked.value;
        const newMovie = {
            id: Math.max(0, ...movie.map((m) => m.id)) + 1,
            poster: v.poster ?? '',
            title: v.title ?? '',
            director: v.director ?? '',
            actor: v.actor ?? '',
            count: v.count ?? '',
            releaseDate: v.releaseDate ?? '',
            country: v.country ?? '',
            company: v.company ?? '',
        };
        movie.push(newMovie);
        return Response.json(newMovie, { status: 201 });
    } catch (err) {
        logError("movie.POST", err);
        return fail(500, "Internal Server Error");
    }
}
