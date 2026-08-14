/**
 * بيانات الفنادق الحقيقية في محافظة الوادي الجديد
 *
 * المصادر:
 *  - موقع محافظة الوادي الجديد الرسمي (newvalley.gov.eg) — آخر تحديث يوليو 2017
 *    الخارجة: http://newvalley.gov.eg/tourism/Pages/tourismDetails.aspx?tourismsCode=18
 *    الداخلة: http://newvalley.gov.eg/tourism/Pages/tourismDetails.aspx?tourismsCode=17
 *  - TripAdvisor (tripadvisor.com) — الفرافرة، 2026
 *
 * ملاحظات:
 *  - النجوم مأخوذة حرفيًا من التصنيف الرسمي للوزارة أو TripAdvisor.
 *  - لا يوجد سعر موثّق لأي فندق من المصادر الرسمية → pricePerNight: null لجميع الفنادق.
 *  - verified: true = الاسم والنجوم مؤكَّدان من مصدر رسمي.
 *  - التصنيف "شعبي" أو "تحت التقييم" يُرمَز بـ stars: null.
 */

export type HotelBudget = "economic" | "medium" | "premium";
export type OasisSlug = "kharga" | "dakhla" | "farafra";

export type Hotel = {
  id: string;
  nameAr: string;
  nameEn: string;
  oasis: OasisSlug;
  oasisNameAr: string;
  /**
   * عدد النجوم من التصنيف الرسمي.
   * null = "شعبي" أو "تحت التقييم" أو غير مصنَّف بعد.
   */
  stars: 1 | 2 | 3 | 4 | 5 | null;
  /** الفئة المناسبة لهذا الفندق بناءً على تصنيفه */
  budget: HotelBudget;
  /**
   * السعر التقريبي للليلة بالجنيه المصري.
   * null = لم يُوثَّق من أي مصدر رسمي.
   */
  pricePerNight: { min: number; max: number } | null;
  descriptionAr: string;
  /** هل تم التحقق من الاسم والتصنيف من مصدر رسمي؟ */
  verified: boolean;
  /** المصدر */
  source: string;
  icon: string;
  /** رقم الهاتف كما ورد في دليل المحافظة (اختياري) */
  phone?: string;
};

// ─────────────────────────────────────────────────────────────
// الخارجة — المصدر: موقع محافظة الوادي الجديد الرسمي
// ─────────────────────────────────────────────────────────────
const KHARGA_HOTELS: Hotel[] = [
  {
    id: "kharga-rawad",
    nameAr: "فندق الرواد",
    nameEn: "Al-Rawad Hotel",
    oasis: "kharga",
    oasisNameAr: "الخارجة",
    stars: 4,
    budget: "premium",
    pricePerNight: null,
    descriptionAr: "أعلى فندق تصنيفًا في الخارجة (4 نجوم)، يضم 102 غرفة.",
    verified: true,
    source: "موقع محافظة الوادي الجديد الرسمي",
    icon: "🏩",
    phone: "7927982",
  },
  {
    id: "kharga-hotel",
    nameAr: "فندق الخارجة",
    nameEn: "Al-Kharga Hotel",
    oasis: "kharga",
    oasisNameAr: "الخارجة",
    stars: 2,
    budget: "medium",
    pricePerNight: null,
    descriptionAr: "فندق 2 نجوم في قلب المدينة، 56 غرفة.",
    verified: true,
    source: "موقع محافظة الوادي الجديد الرسمي",
    icon: "🏨",
    phone: "7921500",
  },
  {
    id: "kharga-hamdallah",
    nameAr: "فندق حمد الله",
    nameEn: "Hamdallah Hotel",
    oasis: "kharga",
    oasisNameAr: "الخارجة",
    stars: 2,
    budget: "medium",
    pricePerNight: null,
    descriptionAr: "فندق 2 نجوم، 54 غرفة.",
    verified: true,
    source: "موقع محافظة الوادي الجديد الرسمي",
    icon: "🏨",
    phone: "7920638",
  },
  {
    id: "kharga-radwan",
    nameAr: "فندق الرضوان",
    nameEn: "Al-Radwan Hotel",
    oasis: "kharga",
    oasisNameAr: "الخارجة",
    stars: 1,
    budget: "economic",
    pricePerNight: null,
    descriptionAr: "فندق نجمة واحدة، 26 غرفة، مناسب للميزانيات المحدودة.",
    verified: true,
    source: "موقع محافظة الوادي الجديد الرسمي",
    icon: "🏠",
    phone: "7929897",
  },
  {
    id: "kharga-waha",
    nameAr: "فندق الواحة",
    nameEn: "Al-Waha Hotel",
    oasis: "kharga",
    oasisNameAr: "الخارجة",
    stars: null,
    budget: "economic",
    pricePerNight: null,
    descriptionAr: "فندق شعبي، 31 غرفة، خيار اقتصادي في وسط المدينة.",
    verified: true,
    source: "موقع محافظة الوادي الجديد الرسمي",
    icon: "🏠",
    phone: "7920393",
  },
  {
    id: "kharga-dar-baida",
    nameAr: "فندق الدار البيضاء",
    nameEn: "Al-Dar Al-Baydaa Hotel",
    oasis: "kharga",
    oasisNameAr: "الخارجة",
    stars: null,
    budget: "economic",
    pricePerNight: null,
    descriptionAr: "فندق شعبي صغير، 15 غرفة.",
    verified: true,
    source: "موقع محافظة الوادي الجديد الرسمي",
    icon: "🏠",
    phone: "7921717",
  },
  {
    id: "kharga-qasr-bagawat",
    nameAr: "فندق قصر البجوات",
    nameEn: "Qasr Al-Bagawat Hotel",
    oasis: "kharga",
    oasisNameAr: "الخارجة",
    stars: null,
    budget: "medium",
    pricePerNight: null,
    descriptionAr: "فندق قريب من مقبرة البجوات الأثرية، تصنيفه قيد المراجعة، 6 غرف.",
    verified: true,
    source: "موقع محافظة الوادي الجديد الرسمي",
    icon: "🏨",
    phone: "01288982114",
  },
];

// ─────────────────────────────────────────────────────────────
// الداخلة — المصدر: موقع محافظة الوادي الجديد الرسمي
// ─────────────────────────────────────────────────────────────
const DAKHLA_HOTELS: Hotel[] = [
  {
    id: "dakhla-desert-lodge",
    nameAr: "فندق ديزرت لودج",
    nameEn: "Desert Lodge Hotel",
    oasis: "dakhla",
    oasisNameAr: "الداخلة",
    stars: 2,
    budget: "medium",
    pricePerNight: null,
    descriptionAr: "أعلى فندق تصنيفًا في الداخلة (2 نجمة)، 32 غرفة، قريب من قرية القصر الأثرية.",
    verified: true,
    source: "موقع محافظة الوادي الجديد الرسمي",
    icon: "🏨",
    phone: "7727061",
  },
  {
    id: "dakhla-fursan",
    nameAr: "فندق الفرسان",
    nameEn: "Al-Fursan Hotel",
    oasis: "dakhla",
    oasisNameAr: "الداخلة",
    stars: 1,
    budget: "economic",
    pricePerNight: null,
    descriptionAr: "فندق نجمة واحدة، 30 غرفة.",
    verified: true,
    source: "موقع محافظة الوادي الجديد الرسمي",
    icon: "🏠",
    phone: "7821347",
  },
  {
    id: "dakhla-mubarez",
    nameAr: "فندق مبارز",
    nameEn: "Mubarez Hotel",
    oasis: "dakhla",
    oasisNameAr: "الداخلة",
    stars: 1,
    budget: "economic",
    pricePerNight: null,
    descriptionAr: "فندق نجمة واحدة، 30 غرفة.",
    verified: true,
    source: "موقع محافظة الوادي الجديد الرسمي",
    icon: "🏠",
    phone: "7821524",
  },
  {
    id: "dakhla-badawiya",
    nameAr: "فندق البدوية",
    nameEn: "Al-Badawiya Hotel",
    oasis: "dakhla",
    oasisNameAr: "الداخلة",
    stars: null,
    budget: "medium",
    pricePerNight: null,
    descriptionAr: "أكبر فنادق الداخلة من حيث عدد الغرف (50 غرفة)، تصنيفه قيد المراجعة.",
    verified: true,
    source: "موقع محافظة الوادي الجديد الرسمي",
    icon: "🏨",
    phone: "7727451",
  },
  {
    id: "dakhla-janayn",
    nameAr: "فندق الجناين",
    nameEn: "Al-Janayn Hotel",
    oasis: "dakhla",
    oasisNameAr: "الداخلة",
    stars: null,
    budget: "economic",
    pricePerNight: null,
    descriptionAr: "فندق شعبي، 22 غرفة.",
    verified: true,
    source: "موقع محافظة الوادي الجديد الرسمي",
    icon: "🏠",
    phone: "7821577",
  },
  {
    id: "dakhla-nojoom",
    nameAr: "فندق النجوم",
    nameEn: "Al-Nojoom Hotel",
    oasis: "dakhla",
    oasisNameAr: "الداخلة",
    stars: null,
    budget: "economic",
    pricePerNight: null,
    descriptionAr: "فندق شعبي حكومي، 37 غرفة، من أكبر الفنادق الشعبية في الداخلة.",
    verified: true,
    source: "موقع محافظة الوادي الجديد الرسمي",
    icon: "🏠",
    phone: "7820014",
  },
];

// ─────────────────────────────────────────────────────────────
// الفرافرة — المصدر: TripAdvisor 2026
// ─────────────────────────────────────────────────────────────
const FARAFRA_HOTELS: Hotel[] = [
  {
    id: "farafra-rahala-safari",
    nameAr: "فندق رحالة سفاري",
    nameEn: "Rahala Safari Hotel",
    oasis: "farafra",
    oasisNameAr: "الفرافرة",
    stars: null,
    budget: "medium",
    pricePerNight: null,
    descriptionAr: "الأعلى تقييمًا في الفرافرة على TripAdvisor (4.9/5)، يوفر جولات سفاري للصحراء البيضاء.",
    verified: true,
    source: "TripAdvisor 2026",
    icon: "🏕️",
  },
  {
    id: "farafra-badawiya",
    nameAr: "فندق البدوية الفرافرة",
    nameEn: "Badawiya Farafra Hotel",
    oasis: "farafra",
    oasisNameAr: "الفرافرة",
    stars: null,
    budget: "economic",
    pricePerNight: null,
    descriptionAr: "أحد أشهر فنادق الفرافرة وأكثرها تقييمًا، يقع في قلب المدينة، مناسب للمسافرين بميزانية محدودة.",
    verified: true,
    source: "TripAdvisor 2026",
    icon: "🏠",
  },
  {
    id: "farafra-aquasun",
    nameAr: "فندق أكوا سن واحة الفرافرة",
    nameEn: "AquaSun Farfara Oasis Hotel",
    oasis: "farafra",
    oasisNameAr: "الفرافرة",
    stars: null,
    budget: "economic",
    pricePerNight: null,
    descriptionAr: "فندق بسيط على أطراف الفرافرة، مناسب للإقامة الليلية للمسافرين في طريقهم للصحراء البيضاء.",
    verified: true,
    source: "TripAdvisor 2026",
    icon: "🏠",
  },
  {
    id: "farafra-shahrazad-camp",
    nameAr: "مخيم شهرزاد في الصحراء البيضاء",
    nameEn: "Shahrazad Camp in White Desert",
    oasis: "farafra",
    oasisNameAr: "الفرافرة",
    stars: null,
    budget: "premium",
    pricePerNight: null,
    descriptionAr: "مخيم داخل الصحراء البيضاء، تجربة تخييم أصيلة تحت النجوم مع إفطار مشمول.",
    verified: true,
    source: "TripAdvisor 2026",
    icon: "⛺",
  },
  {
    id: "farafra-white-desert-camp",
    nameAr: "مخيم الصحراء البيضاء",
    nameEn: "White Desert Camp",
    oasis: "farafra",
    oasisNameAr: "الفرافرة",
    stars: null,
    budget: "premium",
    pricePerNight: null,
    descriptionAr: "مخيم متميز قريب من الصحراء البيضاء، يناسب محبي السفاري والمغامرات.",
    verified: true,
    source: "TripAdvisor 2026",
    icon: "⛺",
  },
];

// ─────────────────────────────────────────────────────────────
// القائمة الموحدة
// ─────────────────────────────────────────────────────────────
export const HOTELS: Hotel[] = [
  ...KHARGA_HOTELS,
  ...DAKHLA_HOTELS,
  ...FARAFRA_HOTELS,
];

// ─────────────────────────────────────────────────────────────
// دوال المساعدة
// ─────────────────────────────────────────────────────────────

/** فلترة الفنادق حسب الميزانية، مع تقديم واحة المستخدم المفضّلة أولاً */
export function getHotelsForPlan(
  budget: HotelBudget,
  preferredOasis?: OasisSlug
): Hotel[] {
  const budgetMatch = HOTELS.filter((h) => h.budget === budget);
  if (!preferredOasis) return budgetMatch;
  const preferred = budgetMatch.filter((h) => h.oasis === preferredOasis);
  const others = budgetMatch.filter((h) => h.oasis !== preferredOasis);
  return [...preferred, ...others];
}

/** تخمين الواحة الأنسب بناءً على اهتمامات المستخدم */
export function guessOasisFromInterests(interests: string[]): OasisSlug {
  if (interests.includes("safari") || interests.includes("nature")) return "farafra";
  if (interests.includes("therapeutic")) return "dakhla";
  return "kharga";
}

/** نص السعر للعرض: "السعر غير متاح" دائمًا لعدم توفر بيانات موثّقة */
export function formatHotelPrice(hotel: Hotel): string {
  if (hotel.pricePerNight) {
    return `${hotel.pricePerNight.min.toLocaleString("ar-EG")} – ${hotel.pricePerNight.max.toLocaleString("ar-EG")} جنيه / الليلة`;
  }
  return "السعر غير متاح — يُنصح بالتواصل مع الفندق مباشرةً";
}

/** نجوم نصية للعرض */
export function formatStars(stars: number | null): string {
  if (!stars) return "غير مصنّف رسميًا";
  return "★".repeat(stars) + "☆".repeat(Math.max(0, 5 - stars)) + ` (${stars} نجوم)`;
}
