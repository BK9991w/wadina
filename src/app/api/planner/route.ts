import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { itineraryRequests } from "@/db/schema";
import { getAttractions, getAttractionsByCategorySlugs } from "@/lib/queries";
import { generateItinerary, type PlannerInput, DEPARTURE_CITIES } from "@/lib/planner";

const departureCityValues = DEPARTURE_CITIES.map((c) => c.value) as [
  string,
  ...string[],
];

const bodySchema = z.object({
  departureCity: z.enum(departureCityValues as [string, ...string[]]),
  days: z.number().int().min(1).max(10),
  persons: z.number().int().min(1).max(50),
  interests: z.array(z.string()).min(0),
  budget: z.enum(["economic", "medium", "premium"]),
  companions: z.enum(["solo", "couple", "family", "friends"]),
});

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "بيانات الطلب غير صحيحة", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data as PlannerInput;

  const pool =
    input.interests.length > 0
      ? await getAttractionsByCategorySlugs(input.interests)
      : await getAttractions();

  const candidatePool =
    pool.length >= input.days * 2 ? pool : await getAttractions();

  const result = generateItinerary(input, candidatePool);

  // Best-effort logging
  try {
    await db.insert(itineraryRequests).values({
      days: input.days,
      interests: input.interests,
      pace: "balanced", // pace is now derived internally
      budget: input.budget,
      companions: input.companions,
      resultSummary: result.summary,
    });
  } catch {
    // non-blocking
  }

  return NextResponse.json({ result });
}
