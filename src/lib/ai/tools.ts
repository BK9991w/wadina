import { db } from "@/db";
import { itineraryRequests } from "@/db/schema";
import { getCategories, getAttractions, getAttractionBySlug } from "@/lib/queries";
import { generateItinerary } from "@/lib/planner";
import type { AIResponse, Trip, ToolName } from "@/types/ai";

// ── Shared types (internal to tools) ──────────────────────────────────────
type CreateTripArgs = {
  days: number;
  interests: string[];
  pace: "relaxed" | "balanced" | "adventurous";
  budget: "economic" | "medium" | "premium";
  companions: "solo" | "couple" | "family" | "friends";
  departureCity?: string;
  persons?: number;
};

type PlaceOpArgs = { placeId: number };
type ReplacePlaceArgs = PlaceOpArgs & { targetDay: number; targetTimeSlot: string };
type SwapArgs = { placeId: number; otherPlaceId: number };
type ReorderArgs = { dayOrder: number[] };
type ChangeDaysArgs = {
  newDays: number;
  interests?: string[];
  pace?: string;
  budget?: string;
  companions?: string;
};

type Result = { ok: boolean; message: string; data?: unknown };

// ── Context serialisation ─────────────────────────────────────────────────
const PRICE_LABEL: Record<string, string> = { free: "مجانًا", low: "اقتصادي", medium: "متوسط", high: "مرتفع" };

type AttractionContext = {
  id: number;
  nameAr: string;
  nameEn: string;
  slug: string;
  cityNameAr: string;
  categoryNameAr: string;
  categoryIcon: string;
  priceLevel: string;
  durationHours: number;
  rating: string;
  imageUrl: string;
  shortDescriptionAr: string;
};

function toContext(a: AttractionContext): string {
  return `[${a.id}] ${a.nameAr} — 📍 ${a.cityNameAr} — ${a.categoryIcon} ${a.categoryNameAr} — 💵 ${PRICE_LABEL[a.priceLevel] ?? a.priceLevel} — ⏱ ${a.durationHours} ساعة — ⭐ ${a.rating}\n  صورة: ${a.imageUrl}`;
}

// ── Data helpers ──────────────────────────────────────────────────────────
async function getAllAttractions(): Promise<AttractionContext[]> {
  const rows = await getAttractions();
  return rows.map((r) => ({
    id: r.id,
    nameAr: r.nameAr,
    nameEn: r.nameEn,
    slug: r.slug,
    cityNameAr: r.cityNameAr,
    categoryNameAr: r.categoryNameAr,
    categoryIcon: r.categoryIcon,
    priceLevel: r.priceLevel,
    durationHours: r.durationHours,
    rating: String(r.rating ?? "4.5"),
    imageUrl: r.imageUrl,
    shortDescriptionAr: r.shortDescriptionAr,
  }));
}

const CATEGORY_MAP: Record<string, string> = {
  heritage: "التراث والآثار",
  safari: "السفاري والمغامرات",
  therapeutic: "السياحة العلاجية",
  nature: "الطبيعة والمحميات",
};

const CITY_MAP: Record<string, string> = {
  kharga: "الخارجة",
  dakhla: "الداخلة",
  farafra: "الفرافرة",
};

async function getFiltered(options?: { category?: string; city?: string; budget?: string }): Promise<AttractionContext[]> {
  const all = await getAllAttractions();
  return all.filter((a) => {
    if (options?.category) {
      const nameMatch = CATEGORY_MAP[options.category] === a.categoryNameAr;
      const slugMatch = a.categoryNameAr === options.category;
      if (!nameMatch && !slugMatch) return false;
    }
    if (options?.city) {
      const nameMatch = CITY_MAP[options.city] === a.cityNameAr;
      const slugMatch = a.cityNameAr === options.city;
      if (!nameMatch && !slugMatch) return false;
    }
    if (options?.budget) {
      const order: Record<string, number> = { free: 0, low: 1, medium: 2, high: 3 };
      if ((order[a.priceLevel] ?? 99) > (order[options.budget] ?? 99)) return false;
    }
    return true;
  });
}

async function searchAttractions(keyword: string): Promise<AttractionContext[]> {
  const all = await getAllAttractions();
  const q = keyword.toLowerCase().trim();
  if (!q) return all;
  return all.filter(
    (a) =>
      a.nameAr.toLowerCase().includes(q) ||
      a.nameEn.toLowerCase().includes(q) ||
      a.shortDescriptionAr.toLowerCase().includes(q) ||
      a.categoryNameAr.toLowerCase().includes(q) ||
      a.cityNameAr.toLowerCase().includes(q),
  );
}

// ── Trip builders ─────────────────────────────────────────────────────────
async function buildTrip(args: CreateTripArgs): Promise<Trip | null> {
  const rows = await getAttractions();
  const pool = args.interests.length > 0 ? rows.filter((r) => args.interests.includes(r.categorySlug)) : rows;
  const candidatePool = pool.length >= args.days * 2 ? pool : rows;
  const fullArgs = {
    ...args,
    departureCity: args.departureCity ?? "assiut",
    persons: args.persons ?? 1,
  };
  const result = generateItinerary(fullArgs as unknown as Parameters<typeof generateItinerary>[0], candidatePool);

  try {
    await db.insert(itineraryRequests).values({
      days: args.days,
      interests: args.interests,
      pace: args.pace,
      budget: args.budget,
      companions: args.companions,
      resultSummary: result.summary,
    });
  } catch {
    // best-effort logging only
  }

  return tripFromPlannerResult(result);
}

function tripFromPlannerResult(r: {
  summary: string;
  seasonAdvice: string;
  budgetAdvice: string;
  days: Array<{
    day: number;
    cityNameAr: string;
    title: string;
    tip: string;
    items: Array<{ timeOfDay: string; attraction: AttractionContext }>;
  }>;
  suggestedProductSlugs: string[];
  hotelOptions?: Array<{ id: string; nameAr: string; nameEn: string; stars: number | null; oasisNameAr: string; budget: string; icon: string; phone?: string }>;
}): Trip {
  return {
    summary: r.summary,
    seasonAdvice: r.seasonAdvice,
    budgetAdvice: r.budgetAdvice,
    suggestedProductSlugs: r.suggestedProductSlugs,
    hotelOptions: r.hotelOptions ?? [],
    days: r.days.map((d) => ({
      day: d.day,
      cityNameAr: d.cityNameAr,
      title: d.title,
      tip: d.tip,
      items: d.items.map((i) => ({
        timeOfDay: i.timeOfDay,
        id: i.attraction.id,
        nameAr: i.attraction.nameAr,
        nameEn: i.attraction.nameEn,
        slug: i.attraction.slug,
        imageUrl: i.attraction.imageUrl,
        priceLevel: i.attraction.priceLevel,
        durationHours: i.attraction.durationHours,
        rating: i.attraction.rating,
        cityNameAr: i.attraction.cityNameAr,
        categoryNameAr: i.attraction.categoryNameAr,
        categoryIcon: i.attraction.categoryIcon,
      })),
    })),
  };
}

// ── Trip mutation helpers ─────────────────────────────────────────────────
async function addPlace(trip: Trip, placeId: number): Promise<{ trip: Trip; message: string } | null> {
  const all = await getAllAttractions();
  const place = all.find((a) => a.id === placeId);
  if (!place) return null;

  const lastDay = trip.days[trip.days.length - 1];
  const timeSlots = ["صباحًا", "ظهرًا", "عصرًا", "مساءً"];

  if (!lastDay || lastDay.items.length >= 4) {
    const newDay: Trip["days"][number] = {
      day: trip.days.length + 1,
      cityNameAr: place.cityNameAr,
      title: `اليوم ${trip.days.length + 1}: ${place.cityNameAr}`,
      items: [{ ...place, timeOfDay: "صباحًا" }],
      tip: `يوم إضافي في ${place.cityNameAr}.`,
    };
    return { trip: { ...trip, days: [...trip.days, newDay] }, message: `✅ أضفت "${place.nameAr}" (${place.cityNameAr}) في اليوم ${trip.days.length + 1}.` };
  }

  const slotIdx = lastDay.items.length;
  const newDays = trip.days.map((d, idx) =>
    idx === trip.days.length - 1
      ? { ...d, items: [...d.items, { timeOfDay: timeSlots[Math.min(slotIdx, 3)], ...place }] }
      : d,
  );
  return { trip: { ...trip, days: newDays }, message: `✅ أضفت "${place.nameAr}" (${place.cityNameAr}) في اليوم ${trip.days.length}.` };
}

async function removePlace(trip: Trip, placeId: number): Promise<{ trip: Trip; message: string } | null> {
  const removedTitles: string[] = [];
  const newDays = trip.days
    .map((d) => {
      const before = d.items.length;
      const filtered = d.items.filter((i) => i.id !== placeId);
      if (filtered.length < before) removedTitles.push(d.title);
      return { ...d, items: filtered };
    })
    .filter((d) => d.items.length > 0);

  if (newDays.length === 0) return null;
  return { trip: { ...trip, days: newDays }, message: `❌ حذفت المكان من: ${removedTitles.join(", ")}.` };
}

async function replacePlace(trip: Trip, targetDay: number, targetTimeSlot: string, placeId: number): Promise<{ trip: Trip; message: string } | null> {
  const all = await getAllAttractions();
  const place = all.find((a) => a.id === placeId);
  if (!place) return null;

  const day = trip.days.find((d) => d.day === targetDay);
  if (!day) return null;
  const idx = day.items.findIndex((i) => i.timeOfDay === targetTimeSlot);
  if (idx < 0) return null;

  const newItems = [...day.items];
  newItems[idx] = { timeOfDay: targetTimeSlot, ...place };
  const newDays = trip.days.map((d) => (d.day === targetDay ? { ...d, items: newItems } : d));
  return { trip: { ...trip, days: newDays }, message: `🔄 استبدلت اليوم ${targetDay} (${targetTimeSlot}) بـ "${place.nameAr}".` };
}

async function swapPlaces(trip: Trip, placeId: number, otherPlaceId: number): Promise<{ trip: Trip; message: string } | null> {
  const all = await getAllAttractions();
  const a = all.find((x) => x.id === placeId);
  const b = all.find((x) => x.id === otherPlaceId);
  if (!a || !b) return null;

  let foundA: { di: number; ii: number } | null = null;
  let foundB: { di: number; ii: number } | null = null;
  for (let di = 0; di < trip.days.length; di++) {
    for (let ii = 0; ii < trip.days[di].items.length; ii++) {
      if (trip.days[di].items[ii].id === placeId) foundA = { di, ii };
      if (trip.days[di].items[ii].id === otherPlaceId) foundB = { di, ii };
    }
  }
  if (!foundA || !foundB) return null;

  const newDays = trip.days.map((d, di) => {
    const items = [...d.items];
    if (di === foundA!.di && di === foundB!.di) {
      const tmp = items[foundA!.ii];
      items[foundA!.ii] = items[foundB!.ii];
      items[foundB!.ii] = tmp;
    } else if (di === foundA!.di) {
      items[foundA!.ii] = { ...trip.days[foundB!.di].items[foundB!.ii], timeOfDay: items[foundA!.ii].timeOfDay };
    } else if (di === foundB!.di) {
      items[foundB!.ii] = { ...trip.days[foundA!.di].items[foundA!.ii], timeOfDay: items[foundB!.ii].timeOfDay };
    }
    return { ...d, items };
  });

  return { trip: { ...trip, days: newDays }, message: `↔ بدّلت "${a.nameAr}" و"${b.nameAr}" بعضهما.` };
}

async function reorderDays(trip: Trip, dayOrder: number[]): Promise<{ trip: Trip; message: string } | null> {
  const map = new Map(trip.days.map((d) => [d.day, d]));
  const ordered = dayOrder.map((d, idx) => {
    const found = map.get(d);
    if (!found) return null;
    return { ...found, day: idx + 1 };
  }).filter(Boolean) as Trip["days"];
  if (ordered.length === 0 || ordered.length !== trip.days.length) return null;
  return { trip: { ...trip, days: ordered }, message: `🔄 أعادت ترتيب الأيام: ${dayOrder.join(" → ")}.` };
}

async function changeDays(trip: Trip, newDays: number, interests?: string[], pace?: string, budget?: string, companions?: string): Promise<Trip | null> {
  if (newDays < 1 || newDays > 10) return null;

  const inferredInterests =
    interests && interests.length > 0
      ? interests
      : trip.days.flatMap((d) => d.items).length > 0
        ? [...new Set(trip.days.flatMap((d) => d.items).map((i) => {
            const m: Record<string, string> = { "التراث والآثار": "heritage", "السفاري والمغامرات": "safari", "السياحة العلاجية": "therapeutic", "الطبيعة والمحميات": "nature" };
            return m[i.categoryNameAr] ?? "nature";
          }))]
        : ["nature"];

  const args: CreateTripArgs = {
    days: newDays,
    interests: inferredInterests,
    pace: (pace ?? "balanced") as "relaxed" | "balanced" | "adventurous",
    budget: (budget ?? "medium") as "economic" | "medium" | "premium",
    companions: (companions ?? "friends") as "solo" | "couple" | "family" | "friends",
  };

  return buildTrip(args);
}

// ── Tool definitions (sent to OpenRouter) ─────────────────────────────────
export const TOOLS: Array<{ name: ToolName; description: string; parameters: Record<string, unknown> }> = [
  {
    name: "get_attractions",
    description: "إرجاع كل الأماكن السياحية في الوادي الجديد. يمكن تصفية حسب الفئة أو المدينة أو الميزانية.",
    parameters: {
      type: "object",
      properties: {
        category: { type: "string", enum: ["heritage", "safari", "therapeutic", "nature"], description: "slug الفئة (اختياري)" },
        city: { type: "string", enum: ["kharga", "dakhla", "farafra"], description: "slug المدينة (اختياري)" },
        budget: { type: "string", enum: ["economic", "medium", "premium"], description: "مستوى الميزانية (اختياري)" },
      },
      required: [],
    },
  },
  {
    name: "search_attractions",
    description: "البحث عن أماكن تحتوي على كلمة مفتاحية في اسمها أو وصفها.",
    parameters: {
      type: "object",
      properties: { keyword: { type: "string", description: "كلمة البحث" } },
      required: ["keyword"],
    },
  },
  {
    name: "get_attraction_details",
    description: "تفاصيل مكان محدد مع نصائح وأفضل موسم.",
    parameters: {
      type: "object",
      properties: { slug: { type: "string", description: "slug المكان" } },
      required: ["slug"],
    },
  },
  {
    name: "create_trip",
    description: "إنشاء رحلة جديدة في الوادي الجديد حسب التفضيلات.",
    parameters: {
      type: "object",
      properties: {
        days: { type: "integer", minimum: 1, maximum: 10, description: "عدد الأيام (1-10)" },
        interests: { type: "array", items: { type: "string", enum: ["heritage", "safari", "therapeutic", "nature"] }, description: "الفئات المفضلة (يمكن أن تكون فارغة)" },
        pace: { type: "string", enum: ["relaxed", "balanced", "adventurous"], description: "إيقاع الرحلة" },
        budget: { type: "string", enum: ["economic", "medium", "premium"], description: "مستوى الميزانية" },
        companions: { type: "string", enum: ["solo", "couple", "family", "friends"], description: "من معك" },
        departureCity: { type: "string", enum: ["cairo", "assiut", "luxor", "aswan", "giza", "sohag", "qena", "minya", "beni-suef"], description: "مدينة الانطلاق (اختياري، افتراضي: assiut)" },
        persons: { type: "integer", minimum: 1, maximum: 20, description: "عدد المسافرين (اختياري، افتراضي: 1)" },
      },
      required: ["days", "pace", "budget", "companions"],
    },
  },
  {
    name: "add_place_to_trip",
    description: "إضافة مكان إلى الرحلة الحالية.",
    parameters: {
      type: "object",
      properties: { placeId: { type: "integer", description: "رقم تعريف المكان" } },
      required: ["placeId"],
    },
  },
  {
    name: "remove_place_from_trip",
    description: "حذف مكان من الرحلة الحالية. استخدم placeId إن عرفته، أو nameAr إن كنت تعرف اسمه فقط.",
    parameters: {
      type: "object",
      properties: {
        placeId: { type: "integer", description: "رقم تعريف المكان (إن توفّر)" },
        nameAr: { type: "string", description: "اسم المكان بالعربية (بديل عن placeId)" },
      },
      required: [],
    },
  },
  {
    name: "replace_place_in_trip",
    description: "استبدال مكان في الرحلة الحالية بمكان آخر في نفس الوقت.",
    parameters: {
      type: "object",
      properties: {
        placeId: { type: "integer", description: "رقم المكان الجديد" },
        targetDay: { type: "integer", description: "رقم اليوم" },
        targetTimeSlot: { type: "string", enum: ["صباحًا", "ظهرًا", "عصرًا", "مساءً"], description: "الوقت" },
      },
      required: ["placeId", "targetDay", "targetTimeSlot"],
    },
  },
  {
    name: "swap_places_in_trip",
    description: "تبديل مكانين في الرحلة الحالية.",
    parameters: {
      type: "object",
      properties: { placeId: { type: "integer" }, otherPlaceId: { type: "integer" } },
      required: ["placeId", "otherPlaceId"],
    },
  },
  {
    name: "reorder_trip_days",
    description: "إعادة ترتيب أيام الرحلة الحالية.",
    parameters: {
      type: "object",
      properties: { dayOrder: { type: "array", items: { type: "integer" } } },
      required: ["dayOrder"],
    },
  },
  {
    name: "change_trip_days",
    description: "تغيير عدد أيام الرحلة الحالية وإعادة بنائها.",
    parameters: {
      type: "object",
      properties: {
        newDays: { type: "integer", minimum: 1, maximum: 10 },
        interests: { type: "array", items: { type: "string", enum: ["heritage", "safari", "therapeutic", "nature"] } },
        pace: { type: "string", enum: ["relaxed", "balanced", "adventurous"] },
        budget: { type: "string", enum: ["economic", "medium", "premium"] },
        companions: { type: "string", enum: ["solo", "couple", "family", "friends"] },
      },
      required: ["newDays"],
    },
  },
  {
    name: "list_available_places",
    description: "قائمة بأسماء جميع الأماكن المتاحة للاختيار.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "select_hotel",
    description: "اختيار فندق من hotelOptions الموجودة في الرحلة الحالية وتضمينه في الخطة.",
    parameters: {
      type: "object",
      properties: {
        hotelId: { type: "string", description: "id الفندق من hotelOptions" },
      },
      required: ["hotelId"],
    },
  },
];

// ── Main execution function ───────────────────────────────────────────────
export async function executeTool(trip: Trip | undefined, toolName: ToolName, args: Record<string, unknown>): Promise<Result> {
  switch (toolName) {
    case "get_attractions": {
      const opts = args as { category?: string; city?: string; budget?: string } | undefined;
      const items = await getFiltered(opts);
      return { ok: true, message: `عثرت على ${items.length} مكانًا.`, data: items.map(toContext) };
    }

    case "search_attractions": {
      const kw = (args as { keyword?: string }).keyword ?? "";
      const items = await searchAttractions(kw);
      return { ok: true, message: `وجدت ${items.length} مكانًا لـ "${kw}"`, data: items.map(toContext) };
    }

    case "get_attraction_details": {
      const slug = (args as { slug?: string }).slug;
      const row = await getAttractionBySlug(slug ?? "");
      if (!row) return { ok: false, message: `المكان "${slug}" غير مسجل في النظام.` };
      return {
        ok: true,
        message: `إليك تفاصيل "${row.nameAr}":`,
        data: {
          id: row.id,
          nameAr: row.nameAr,
          nameEn: row.nameEn,
          slug: row.slug,
          cityNameAr: row.cityNameAr,
          categoryNameAr: row.categoryNameAr,
          categoryIcon: row.categoryIcon,
          descriptionAr: row.descriptionAr,
          shortDescriptionAr: row.shortDescriptionAr,
          priceLevel: row.priceLevel,
          durationHours: row.durationHours,
          bestSeasonAr: row.bestSeasonAr,
          rating: String(row.rating ?? "4.5"),
          imageUrl: row.imageUrl,
          highlights: row.highlights,
          tipsAr: row.tipsAr,
          tags: row.tags,
        },
      };
    }

    case "create_trip": {
      const a = args as CreateTripArgs;
      const trip = await buildTrip(a);
      if (!trip) return { ok: false, message: "لم أتمكن من إنشاء الرحلة. حاول مرة أخرى." };
      return { ok: true, message: "تم إنشاء رحلتك!", data: trip };
    }

    case "add_place_to_trip": {
      if (!trip) return { ok: false, message: "لا توجد رحلة حالية. اطلب مني أولاً إنشاء رحلة." };
      const result = await addPlace(trip, (args as PlaceOpArgs).placeId);
      if (!result) return { ok: false, message: "المكان غير موجود أو لا يمكن إضافته." };
      return { ok: true, message: result.message, data: result.trip };
    }

    case "remove_place_from_trip": {
      if (!trip) return { ok: false, message: "لا توجد رحلة حالية لحذف منها." };
      let placeId = (args as PlaceOpArgs).placeId;
      // If AI passes placeId=0 or undefined, try to resolve by name from the current trip
      if (!placeId && (args as Record<string, unknown>).nameAr) {
        const nameAr = (args as Record<string, unknown>).nameAr as string;
        const found = trip.days.flatMap((d) => d.items).find((i) => i.nameAr.includes(nameAr));
        if (found) placeId = found.id;
      }
      const result = await removePlace(trip, placeId);
      if (!result) return { ok: false, message: "هذا المكان غير موجود في الرحلة الحالية." };
      return { ok: true, message: result.message, data: result.trip };
    }

    case "replace_place_in_trip": {
      if (!trip) return { ok: false, message: "لا توجد رحلة حالية." };
      const a = args as ReplacePlaceArgs;
      const result = await replacePlace(trip, a.targetDay, a.targetTimeSlot, a.placeId);
      if (!result) return { ok: false, message: "اليوم أو الوقت المطلوب غير موجود في الرحلة الحالية." };
      return { ok: true, message: result.message, data: result.trip };
    }

    case "swap_places_in_trip": {
      if (!trip) return { ok: false, message: "لا توجد رحلة حالية." };
      const a = args as SwapArgs;
      const result = await swapPlaces(trip, a.placeId, a.otherPlaceId);
      if (!result) return { ok: false, message: "واحد من المكانين غير موجود في الرحلة الحالية." };
      return { ok: true, message: result.message, data: result.trip };
    }

    case "reorder_trip_days": {
      if (!trip) return { ok: false, message: "لا توجد رحلة حالية." };
      const a = args as ReorderArgs;
      const result = await reorderDays(trip, a.dayOrder);
      if (!result) return { ok: false, message: "ترتيب الأيام غير صحيح أو لا يتطابق مع أيام الرحلة الحالية." };
      return { ok: true, message: result.message, data: result.trip };
    }

    case "change_trip_days": {
      if (!trip) return { ok: false, message: "لا توجد رحلة حالية." };
      const a = args as ChangeDaysArgs;
      const newTrip = await changeDays(trip, a.newDays, a.interests, a.pace, a.budget, a.companions);
      if (!newTrip) return { ok: false, message: "عدد الأيام غير صحيح (يجب أن يكون بين 1 و10)." };
      return { ok: true, message: `🔄 غيّرت الرحلة إلى ${a.newDays} أيام.`, data: newTrip };
    }

    case "list_available_places": {
      const items = await getAllAttractions();
      return { ok: true, message: `${items.length} أماكن متاحة في الوادي الجديد.`, data: items.map(toContext) };
    }

    case "select_hotel": {
      if (!trip) return { ok: false, message: "لا توجد رحلة حالية." };
      const hotelId = String(args.hotelId ?? "");
      const hotel = trip.hotelOptions?.find((h) => h.id === hotelId);
      if (!hotel) return { ok: false, message: `لم يُعثر على فندق بالمعرّف: ${hotelId}` };
      const updatedTrip: Trip = { ...trip, selectedHotel: hotel };
      return { ok: true, message: `✅ تم اختيار الفندق: ${hotel.nameAr} في ${hotel.oasisNameAr}.`, data: updatedTrip };
    }

    default:
      return { ok: false, message: `أداة غير معروفة: ${toolName}` };
  }
}
