import { connection, type NextRequest } from "next/server";
import { guardWrite, json, readJson } from "../../_lib/auth";
import { getById, remove, update } from "../store";
import { parseId, parseInput } from "../validate";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/japan/:id (공개)
export async function GET(_req: NextRequest, { params }: Ctx) {
  await connection();
  const id = parseId((await params).id);
  if (id === null) return json({ error: "잘못된 id입니다." }, 400);
  const item = await getById(id);
  return item ? json(item) : json({ error: "찾을 수 없습니다." }, 404);
}

// PUT /api/japan/:id (관리자)
export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = guardWrite(req);
  if (denied) return denied;

  const id = parseId((await params).id);
  if (id === null) return json({ error: "잘못된 id입니다." }, 400);

  const parsed = parseInput(await readJson(req));
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  const updated = await update(id, parsed.value);
  return updated ? json(updated) : json({ error: "찾을 수 없습니다." }, 404);
}

// DELETE /api/japan/:id (관리자)
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = guardWrite(req);
  if (denied) return denied;

  const id = parseId((await params).id);
  if (id === null) return json({ error: "잘못된 id입니다." }, 400);

  return (await remove(id))
    ? json({ ok: true })
    : json({ error: "찾을 수 없습니다." }, 404);
}
