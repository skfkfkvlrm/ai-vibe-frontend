import { connection, type NextRequest } from "next/server";
import { guardWrite, json, readJson } from "../_lib/auth";
import { create, listAll } from "./store";
import { parseInput } from "./validate";

// GET /api/japan : 여행지 목록 (공개)
export async function GET() {
  await connection();
  return json(await listAll());
}

// POST /api/japan : 여행지 생성 (관리자)
export async function POST(req: NextRequest) {
  const denied = guardWrite(req);
  if (denied) return denied;

  const parsed = parseInput(await readJson(req));
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  const created = await create(parsed.value);
  return json(created, 201);
}
