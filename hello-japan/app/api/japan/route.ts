import { NextResponse } from "next/server";
import { destinations } from "./data";

// GET /api/japan : 여행지 목록
export async function GET() {
  return NextResponse.json(destinations);
}
