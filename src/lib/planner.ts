import type { AttractionListItem } from "./queries";
import type { Hotel } from "./hotels";
import { getHotelsForPlan, guessOasisFromInterests } from "./hotels";

// ─── Departure city options ────────────────────────────────────────────────
export const DEPARTURE_CITIES = [
  { value: "cairo", label: "القاهرة", distanceKm: 680 },
  { value: "giza", label: "الجيزة", distanceKm: 650 },
  { value: "assiut", label: "أسيوط", distanceKm: 310 },
  { value: "sohag", label: "سوهاج", distanceKm: 270 },
  { value: "qena", label: "قنا", distanceKm: 360 },
  { value: "luxor", label: "الأقصر", distanceKm: 430 },
  { value: "aswan", label: "أسوان", distanceKm: 550 },
  { value: "minya", label: "المنيا", distanceKm: 420 },
  { value: "beni-suef", label: "بني سويف", distanceKm: 500 },
  { value: "asyut", label: "أسيوط", distanceKm: 310 },
] as const;

export type DepartureCity = (typeof DEPARTURE_CITIES)[number]["value"];

// ─── Transport options per budget ──────────────────────────────────────────
const TRANSPORT_BY_BUDGET: Record<
  PlannerInput["budget"],
  { label: string; desc: string; icon: string }
> = {
  economic: {
    icon: "🚌",
    label: "أتوبيس مكيف",
    desc: "أوفر الخيارات — خطوط مباشرة من معظم المحافظات",
  },
  medium: {
    icon: "🚗",
    label: "سيارة خاصة أو تأجير سيارة",
    desc: "مريح وعملي — يتيح لك حرية التنقل بين الواحات",
  },
  premium: {
    icon: "✈️",
    label: "طيران داخلي + سيارة خاصة",
    desc: "أسرع وأكثر راحة — رحلات طيران من القاهرة / أسيوط",
  },
};

// ─── Hotel tiers per budget ────────────────────────────────────────────────
const HOTEL_BY_BUDGET: Record<
  PlannerInput["budget"],
  { tier: string; examples: string; icon: string; priceRange: string }
> = {
  economic: {
    icon: "🏠",
    tier: "استراحة شعبية أو شقة مفروشة",
    examples: "مثل استراحات وسط الخارجة أو شقق إيجار يومي",
    priceRange: "100 – 250 جنيه / الليلة تقريبًا",
  },
  medium: {
    icon: "🏨",
    tier: "فندق 3 نجوم",
    examples: "مثل فندق سيوة أو العربي بالخارجة",
    priceRange: "400 – 800 جنيه / الليلة تقريبًا",
  },
  premium: {
    icon: "🏩",
    tier: "فندق 4–5 نجوم أو منتجع",
    examples: "مثل المنتجعات الصحراوية عند الصحراء البيضاء",
    priceRange: "1200 جنيه+ / الليلة تقريبًا",
  },
};

// ─── Types ─────────────────────────────────────────────────────────────────
export type PlannerInput = {
  departureCity: DepartureCity;
  days: number;
  persons: number;
  interests: string[]; // category slugs: heritage | safari | therapeutic | nature
  budget: "economic" | "medium" | "premium";
  companions: "solo" | "couple" | "family" | "friends";
  /** هل الرحلة تقتصر على واحة واحدة أم تتوزع بين عدة واحات؟ */
  travelScope: "single" | "multi";
};

export type PlannerDay = {
  day: number;
  cityNameAr: string;
  citySlug: string;
  title: string;
  items: {
    timeOfDay: "صباحًا" | "ظهرًا" | "عصرًا" | "مساءً";
    attraction: AttractionListItem;
    /** GPS coords — populated when available, null otherwise */
    gps: { lat: number; lng: number } | null;
  }[];
  tip: string;
  /**
   * ملاحظة الانتقال — تظهر فقط عند تغيّر المدينة بين يوم وآخر (multi scope).
   * null = لا انتقال (نفس المدينة أو اليوم الأول).
   */
  transitionNote: string | null;
};

export type TravelPlan = {
  departureLabel: string;
  transport: { icon: string; label: string; desc: string };
  hotel: { icon: string; tier: string; examples: string; priceRange: string };
  arrivalNote: string;
};

export type PlannerResult = {
  summary: string;
  travelPlan: TravelPlan;
  seasonAdvice: string;
  budgetAdvice: string;
  days: PlannerDay[];
  suggestedProductSlugs: string[];
  /** Placeholder — will be populated with real coordinates from DB when available */
  mapReady: boolean;
  /** قائمة الفنادق المقترحة للاختيار منها (مرتّبة حسب الميزانية والواحة) */
  hotelOptions: Hotel[];
  /** الفندق الذي اختاره المستخدم (null = لم يختر بعد) */
  selectedHotel: Hotel | null;
};

// ─── Pace items-per-day ────────────────────────────────────────────────────
// Without a pace field now (removed from wizard) — we derive from interests:
// safari/adventure → 2 per day (demanding), others → 3 per day
function pacePerDay(interests: string[]): number {
  if (interests.includes("safari")) return 2;
  return 3;
}

// ─── Budget scoring ────────────────────────────────────────────────────────
const BUDGET_PRICE_ORDER: Record<PlannerInput["budget"], string[]> = {
  economic: ["free", "low", "medium", "high"],
  medium: ["low", "medium", "free", "high"],
  premium: ["medium", "high", "low", "free"],
};

const TIME_SLOTS: PlannerDay["items"][number]["timeOfDay"][] = [
  "صباحًا",
  "ظهرًا",
  "عصرًا",
  "مساءً",
];

function scoreAttraction(
  a: AttractionListItem,
  input: PlannerInput
): number {
  let score = 0;
  // Budget fit
  const budgetOrder = BUDGET_PRICE_ORDER[input.budget];
  const priceIdx = budgetOrder.indexOf(a.priceLevel);
  score += (budgetOrder.length - (priceIdx === -1 ? budgetOrder.length : priceIdx)) * 3;
  // Family bonus
  if (input.companions === "family" && a.tags?.includes("family-friendly"))
    score += 5;
  // Featured boost
  if (a.isFeatured) score += 3;
  // Rating
  score += Number(a.rating ?? 4.5);
  return score;
}

/**
 * Filter attractions by selected interests (STRICT).
 * Only returns attractions matching the chosen categories.
 * Falls back gracefully only when results are critically insufficient.
 */
function filterByInterests(
  attractions: AttractionListItem[],
  input: PlannerInput
): AttractionListItem[] {
  if (input.interests.length === 0) return attractions;

  const matched = attractions.filter((a) =>
    input.interests.includes(a.categorySlug)
  );

  // Enough for at least 1 attraction per day → strict filter
  if (matched.length >= input.days) return matched;

  // Critically few: append unmatched as last-resort backfill
  const unmatched = attractions.filter(
    (a) => !input.interests.includes(a.categorySlug)
  );
  return [...matched, ...unmatched];
}

// ─── GPS coordinates for known attractions ─────────────────────────────────
// Real coordinates only — no invented GPS. Slugs not listed return null.
const ATTRACTION_GPS: Record<string, { lat: number; lng: number }> = {
  // Kharga oasis attractions
  "temple-of-hibis":          { lat: 25.4511, lng: 30.5450 },
  "qasr-el-ghueita":          { lat: 25.3200, lng: 30.5667 },
  "al-bagawat-necropolis":    { lat: 25.4583, lng: 30.5517 },
  "kharga-sandboarding-dunes":{ lat: 25.3800, lng: 30.5200 },
  // Dakhla oasis attractions
  "al-qasr-old-town":         { lat: 25.6931, lng: 28.8908 },
  "balat-ancient-village":    { lat: 25.5800, lng: 29.0333 },
  "deir-el-hagar-temple":     { lat: 25.5514, lng: 28.9697 },
  "mut-talata-hot-spring":    { lat: 25.4981, lng: 28.9600 },
  "bir-naser-sulphur-spring": { lat: 25.5100, lng: 29.0100 },
  "bir-sitta-hot-spring":     { lat: 25.4900, lng: 29.0000 },
  // Farafra / White Desert
  "white-desert-national-park":    { lat: 27.0533, lng: 28.0583 },
  "white-desert-overnight-camp":   { lat: 27.0500, lng: 28.0600 },
  "great-sand-sea-safari":         { lat: 26.8000, lng: 27.6000 },
  "crystal-mountain":              { lat: 27.6336, lng: 28.2619 },
  "el-mufid-lake":                 { lat: 25.6600, lng: 28.8500 },

  // New Heritage — Kharga
  "temple-of-nadura":              { lat: 25.4489, lng: 30.5531 },
  "qasr-zayan":                    { lat: 25.0808, lng: 30.6589 },
  "ain-umur-temple":               { lat: 24.6100, lng: 30.6300 },
  "new-valley-museum":             { lat: 25.4456, lng: 30.5568 },
  "qasr-el-doush":                 { lat: 24.5597, lng: 30.7100 },

  // New Heritage — Dakhla
  "muzawaka-tombs":                { lat: 25.5667, lng: 28.9500 },
  "qalamoun-village":              { lat: 25.6000, lng: 28.8667 },
  "ain-asil-site":                 { lat: 25.5639, lng: 29.0514 },

  // New Safari
  "darb-el-arbain-trail":          { lat: 25.1500, lng: 30.5800 },
  "black-desert-safari":           { lat: 27.6500, lng: 28.3000 },
  "dakhla-stargazing-camp":        { lat: 25.4700, lng: 28.9200 },
  "multi-oasis-jeep-tour":         { lat: 25.4456, lng: 30.5568 },
  "dakhla-quad-bike-adventure":    { lat: 25.4895, lng: 28.9700 },

  // New Nature
  "wadi-el-rayan-dakhla":          { lat: 25.3500, lng: 28.7500 },
  "farafra-depression-geology":    { lat: 27.0300, lng: 27.9000 },
  "kharga-oasis-lake":             { lat: 25.4700, lng: 30.5200 },
  "inselberg-farafra":             { lat: 27.1200, lng: 27.8500 },
  "farafra-palm-groves":           { lat: 27.0598, lng: 27.9698 },

  // New Therapeutic
  "ain-el-gifa-spring":            { lat: 25.3900, lng: 30.5300 },
  "mut-bir-wahid":                 { lat: 25.4800, lng: 28.9800 },
  "hot-sand-therapy-kharga":       { lat: 25.4456, lng: 30.5568 },
  "kharga-wellness-resort":        { lat: 25.4500, lng: 30.5500 },
};

function resolveGps(slug: string): { lat: number; lng: number } | null {
  return ATTRACTION_GPS[slug] ?? null;
}

// ─── Main generator ────────────────────────────────────────────────────────
export function generateItinerary(
  input: PlannerInput,
  attractions: AttractionListItem[]
): PlannerResult {
  // 1. Filter strictly by interest category, then sort by score within that pool
  const filtered = filterByInterests(attractions, input);
  const pool = [...filtered].sort(
    (a, b) => scoreAttraction(b, input) - scoreAttraction(a, input)
  );

  const preferredPerDay = pacePerDay(input.interests);

  // Group by city to minimise travel
  const byCity = new Map<string, AttractionListItem[]>();
  for (const item of pool) {
    const arr = byCity.get(item.cityNameAr) ?? [];
    arr.push(item);
    byCity.set(item.cityNameAr, arr);
  }
  const cityOrder = [...byCity.keys()].sort(
    (a, b) => (byCity.get(b)?.length ?? 0) - (byCity.get(a)?.length ?? 0)
  );

  // Collect all eligible attractions (budget-aware), no slot cap yet
  const eligible: AttractionListItem[] = [];
  for (const city of cityOrder) {
    for (const item of byCity.get(city) ?? []) {
      if (
        input.budget === "economic" &&
        item.priceLevel === "high" &&
        eligible.length < pool.length - input.days
      )
        continue;
      eligible.push(item);
    }
  }
  // Backfill from full pool if still short
  for (const item of pool) {
    if (!eligible.find((s) => s.id === item.id)) eligible.push(item);
  }

  /**
   * Distribute `eligible` across `input.days` days evenly.
   * - Aim for `preferredPerDay` per day.
   * - If total available < days × preferredPerDay, reduce perDay so every day
   *   gets at least 1 attraction rather than later days getting nothing.
   * - Never repeat an attraction.
   */
  const totalAvailable = eligible.length;
  // Actual per-day: at least 1, at most preferredPerDay
  const perDay = Math.max(
    1,
    Math.min(preferredPerDay, Math.floor(totalAvailable / input.days))
  );
  // How many extra items we can distribute (remainder)
  const remainder = totalAvailable - perDay * input.days;

  const days: PlannerDay[] = [];
  let cursor = 0;
  for (let d = 1; d <= input.days; d++) {
    // Give one extra attraction to the first `remainder` days
    const take = perDay + (d - 1 < remainder ? 1 : 0);
    const dayItems = eligible.slice(cursor, cursor + take);
    cursor += take;
    const primaryCity =
      dayItems[0]?.cityNameAr ?? cityOrder[0] ?? "الوادي الجديد";
    const prevCity = days[days.length - 1]?.cityNameAr ?? null;
    days.push({
      day: d,
      cityNameAr: primaryCity,
      citySlug: dayItems[0]?.citySlug ?? primaryCity,
      title: `اليوم ${d}: استكشاف ${primaryCity}`,
      items: dayItems.map((attraction, idx) => ({
        timeOfDay: TIME_SLOTS[Math.min(idx, TIME_SLOTS.length - 1)],
        attraction,
        gps: resolveGps(attraction.slug),
      })),
      tip: buildDayTip(dayItems, input),
      transitionNote:
        prevCity && prevCity !== primaryCity
          ? `انتقال من ${prevCity} إلى ${primaryCity}`
          : null,
    });
  }

  // Travel plan (departure → destination)
  const departureInfo =
    DEPARTURE_CITIES.find((c) => c.value === input.departureCity) ??
    DEPARTURE_CITIES[0];
  const transport = TRANSPORT_BY_BUDGET[input.budget];
  const hotel = HOTEL_BY_BUDGET[input.budget];

  const travelPlan: TravelPlan = {
    departureLabel: departureInfo.label,
    transport,
    hotel,
    arrivalNote: buildArrivalNote(departureInfo, input.budget),
  };

  // Advice texts
  const hasSafari = input.interests.includes("safari");
  const hasTherapeutic = input.interests.includes("therapeutic");

  const seasonAdvice = hasSafari
    ? "ننصح بتجنب أشهر الصيف (يونيو-أغسطس) لرحلات السفاري؛ أفضل وقت من أكتوبر حتى أبريل."
    : "الوادي الجديد رائع طوال العام، لكن أشهر الشتاء (نوفمبر-فبراير) هي الأنسب للتجول نهارًا.";

  const budgetAdvice = buildBudgetAdvice(input);

  // Summary
  const companionLabel: Record<PlannerInput["companions"], string> = {
    solo: "رحلتك الفردية",
    couple: "رحلتكما الرومانسية",
    family: "رحلة عائلتك",
    friends: "رحلة مجموعة أصدقائك",
  };
  const interestText =
    input.interests.length > 0
      ? interestsLabel(input.interests)
      : "أبرز معالم الوادي الجديد";

  const summary = `خطة ${input.days} ${input.days === 1 ? "يوم" : "أيام"} لـ${personLabel(input.persons)} — ${companionLabel[input.companions]}، منطلقةً من ${departureInfo.label}، تركّز على ${interestText}.`;

  // Hotel options: pick suitable oasis based on interests then offer choices by budget
  const preferredOasis = guessOasisFromInterests(input.interests);
  const hotelOptions = getHotelsForPlan(input.budget, preferredOasis);

  return {
    summary,
    travelPlan,
    seasonAdvice,
    budgetAdvice,
    days,
    suggestedProductSlugs: buildProductSuggestions(input),
    mapReady: days.some((d) => d.items.some((i) => i.gps !== null)),
    hotelOptions,
    selectedHotel: null,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function personLabel(n: number): string {
  if (n === 1) return "فرد واحد";
  if (n === 2) return "شخصين";
  if (n <= 10) return `${n} أشخاص`;
  return `${n} شخصًا`;
}

function interestsLabel(slugs: string[]): string {
  const map: Record<string, string> = {
    heritage: "التراث والآثار",
    safari: "السفاري والمغامرات",
    therapeutic: "السياحة العلاجية",
    nature: "الطبيعة والمحميات",
  };
  return slugs.map((s) => map[s] ?? s).join(" و");
}

function buildArrivalNote(
  city: (typeof DEPARTURE_CITIES)[number],
  budget: PlannerInput["budget"]
): string {
  if (budget === "economic")
    return `من ${city.label} (~${city.distanceKm} كم) — الأتوبيس المكيف يصل الخارجة في نحو ${Math.round(city.distanceKm / 70)} ساعات.`;
  if (budget === "medium")
    return `من ${city.label} (~${city.distanceKm} كم) — بالسيارة الخاصة في نحو ${Math.round(city.distanceKm / 90)} ساعات عبر طريق الفرافرة.`;
  return `من ${city.label} — يُنصح باستخدام الطيران الداخلي إن أمكن، أو السيارة الخاصة للراحة الكاملة.`;
}

function buildBudgetAdvice(input: PlannerInput): string {
  const perPerson =
    input.budget === "economic"
      ? "150 – 350"
      : input.budget === "medium"
        ? "500 – 900"
        : "1200+";
  return `بميزانية ${input.budget === "economic" ? "اقتصادية" : input.budget === "medium" ? "متوسطة" : "مميزة"} لـ${personLabel(input.persons)}: توقع إنفاق ~${perPerson} جنيه/اليوم على الأنشطة والطعام (غير شامل الإقامة والتنقل).`;
}

function buildDayTip(
  items: AttractionListItem[],
  input: PlannerInput
): string {
  if (items.length === 0) return "يوم حر للاسترخاء أو التسوق من المنتجات المحلية.";
  const hasSafariItem = items.some((i) => i.categorySlug === "safari");
  const hasTherapeuticItem = items.some((i) => i.categorySlug === "therapeutic");
  if (hasSafariItem)
    return "احضر ملابس مريحة، ماء كافٍ، وواقي شمس ليوم مليء بالمغامرة.";
  if (hasTherapeuticItem)
    return "أحضر ملابس سباحة ومنشفة للاستمتاع بالعيون الحرارية دون قلق.";
  if (input.companions === "family")
    return "الأطفال يحبون زيارة المعابد — احمل معك ماءً وأوناشًا خفيفة.";
  return "يفضّل البدء مبكرًا لتفادي الزحام والاستفادة من إضاءة الصباح للتصوير.";
}

function buildProductSuggestions(input: PlannerInput): string[] {
  if (input.interests.includes("therapeutic"))
    return ["wild-desert-honey", "desert-olive-oil"];
  if (input.interests.includes("safari"))
    return ["oasis-dates", "palm-frond-crafts"];
  return ["oasis-dates", "handmade-pottery", "wool-kilim-rugs"];
}
