import { redirect } from "next/navigation";
import { comments } from "../data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
    const { id } = await params;
    if (parseInt(id) > comments.length) {
        redirect("/comments");
    }
    const comment = comments.find((c) => c.id === parseInt(id));
    if (!comment) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(comment);
}

export async function PUT(request: Request, { params }: Params) {
    const { id } = await params;
    const body = await request.json();
    const { text } = body;
    const commentIndex = comments.findIndex((c) => c.id === parseInt(id));
    if (commentIndex === -1) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }
    comments[commentIndex].text = text;
    return Response.json(comments[commentIndex]);
}

export async function DELETE(_request: Request, { params }: Params) {
    const { id } = await params;
    const commentIndex = comments.findIndex((c) => c.id === parseInt(id));
    if (commentIndex === -1) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }
    const [deleted] = comments.splice(commentIndex, 1);
    return Response.json(deleted);
}
