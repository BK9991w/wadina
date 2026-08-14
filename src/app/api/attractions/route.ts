import { NextRequest, NextResponse } from "next/server";
import { getAttractionsByIds } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json({ attractions: [] });
  }
  const ids = idsParam
    .split(",")
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));

  const attractions = await getAttractionsByIds(ids);
  return NextResponse.json({ attractions });
}
