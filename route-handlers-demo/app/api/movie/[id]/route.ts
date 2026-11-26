import { movie } from "../data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
    const { id } = await params;
    const found = movie.find((m) => m.id === parseInt(id));
    if (!found) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(found);
}

export async function PUT(request: Request, { params }: Params) {
    const { id } = await params;
    const body = await request.json();
    const index = movie.findIndex((m) => m.id === parseInt(id));
    if (index === -1) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }
    movie[index] = { ...movie[index], ...body, id: movie[index].id };
    return Response.json(movie[index]);
}

export async function DELETE(_request: Request, { params }: Params) {
    const { id } = await params;
    const index = movie.findIndex((m) => m.id === parseInt(id));
    if (index === -1) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }
    const [deleted] = movie.splice(index, 1);
    return Response.json(deleted);
}
