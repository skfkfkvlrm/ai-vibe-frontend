import type { NextRequest } from "next/server";
import { isAdmin, json } from "../../_lib/auth";

export async function GET(req: NextRequest) {
  return json({ admin: isAdmin(req) });
}
