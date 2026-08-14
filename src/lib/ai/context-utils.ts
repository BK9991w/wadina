import type { Trip } from "@/types/ai";

/**
 * Format tool execution results for the AI's follow-up context.
 * Handles arrays of attraction context strings and trip objects.
 */
export function describeAttractionsToolContext(data: unknown): string {
  if (!data) return "(لا يوجد ناتج)";

  // Array of attraction context strings
  if (Array.isArray(data)) {
    if (data.length === 0) return "(لا توجد أماكن مطابقة)";
    return data.map((item, i) => `--- مكان ${i + 1} ---\n${item}`).join("\n\n");
  }

  // Single attraction detail object
  if (typeof data === "object") {
    const d = data as Record<string, unknown>;
    const nameAr = typeof d.nameAr === "string" ? d.nameAr : "مكان غير معروف";
    const blocks: string[] = [`🏛️ ${nameAr}`];

    if (typeof d.descriptionAr === "string" && d.descriptionAr) blocks.push(`الوصف: ${d.descriptionAr}`);
    if (typeof d.bestSeasonAr === "string" && d.bestSeasonAr) blocks.push(`أفضل موسم: ${d.bestSeasonAr}`);
    if (typeof d.tipsAr === "string" && d.tipsAr) blocks.push(`نصيحة: ${d.tipsAr}`);
    if (typeof d.priceLevel === "string" && d.priceLevel) blocks.push(`التكلفة: ${d.priceLevel}`);
    if (typeof d.durationHours === "number") blocks.push(`المدة: ${d.durationHours} ساعة`);
    if (typeof d.rating === "string" && d.rating) blocks.push(`التقييم: ${d.rating}`);
    if (typeof d.cityNameAr === "string") blocks.push(`المدينة: ${d.cityNameAr}`);
    if (typeof d.categoryNameAr === "string") blocks.push(`الفئة: ${d.categoryNameAr}`);

    const highlights = d.highlights;
    if (Array.isArray(highlights) && highlights.length > 0) {
      blocks.push(`أبرز ما يميزه:\n${highlights.map((h: string) => "  ✓ " + h).join("\n")}`);
    }

    return blocks.join("\n");
  }

  return JSON.stringify(data).slice(0, 3000);
}

/**
 * Convert a Trip object to a readable context string for the AI.
 */
export function tripToContext(trip: Trip): string {
  if (!trip || !trip.days?.length) return "(لا توجد رحلة حالية)";

  const lines = [
    `📋 ملخص الرحلة: ${trip.summary || "بدون ملخص"}`,
    `🌡️ نصيحة الموسم: ${trip.seasonAdvice || "بدون نصيحة"}`,
    `💰 نصيحة الميزانية: ${trip.budgetAdvice || "بدون نصيحة"}`,
    "",
  ];

  for (const day of trip.days) {
    lines.push(`--- اليوم ${day.day}: ${day.title || `اليوم ${day.day}`} ---`);
    lines.push(`📍 المدينة: ${day.cityNameAr}`);
    if (day.tip) lines.push(`💡 نصيحة: ${day.tip}`);
    if (day.items && day.items.length > 0) {
      lines.push("الأنشطة:");
      for (const item of day.items) {
        const time = typeof item.timeOfDay === "string" ? item.timeOfDay : "";
        const name = typeof item.nameAr === "string" ? item.nameAr : "مكان غير معروف";
        const rating = typeof item.rating === "string" ? item.rating : "";
        const price = typeof item.priceLevel === "string" ? item.priceLevel : "";
        lines.push(`  ${time ? time + " — " : ""}${name} ${rating ? "⭐" + rating : ""} ${price ? "💵" + price : ""}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}
