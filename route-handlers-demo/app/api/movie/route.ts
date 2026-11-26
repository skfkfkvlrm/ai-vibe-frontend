import { NextRequest } from "next/server";
import { movie } from "./data";

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get("query");
    const filteredMovies = query ? movie.filter(
        (m) => m.title.includes(query) || m.director.includes(query)) : movie;
    return Response.json(filteredMovies);
}

export async function POST(request: Request) {
    const body = await request.json();
    const newMovie = {
        id: Math.max(0, ...movie.map((m) => m.id)) + 1,
        poster: body.poster ?? '',
        title: body.title,
        director: body.director,
        actor: body.actor ?? '',
        count: body.count,
    };
    movie.push(newMovie);
    return new Response(JSON.stringify(newMovie), {
        headers: { "Content-Type": "application/json" },
        status: 201,
    });
}
