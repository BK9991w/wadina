"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { getCategories } from "@/lib/queries";
import type { PlannerResult } from "@/lib/planner";
import { DEPARTURE_CITIES } from "@/lib/planner";
import type { Hotel } from "@/lib/hotels";
import { formatStars } from "@/lib/hotels";
import { ItineraryMap } from "@/components/ItineraryMap";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "@/components/AuthModal";

type Categories = Awaited<ReturnType<typeof getCategories>>;

type FormState = {
  departureCity: string;
  days: number;
  persons: number;
  interests: string[];
  budget: "economic" | "medium" | "premium" | "";
  companions: "solo" | "couple" | "family" | "friends" | "";
};

const BUDGET_OPTIONS = [
  {
    value: "economic",
    label: "اقتصادية",
    desc: "أماكن مجانية ومنخفضة التكلفة",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-400",
    icon: "🟢",
  },
  {
    value: "medium",
    label: "متوسطة",
    desc: "خيارات متوازنة بين الجودة والسعر",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-400",
    icon: "🔵",
  },
  {
    value: "premium",
    label: "مميزة",
    desc: "أفضل الفنادق والتجارب الحصرية",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-400",
    icon: "🟡",
  },
] as const;

const COMPANION_OPTIONS = [
  { value: "solo", label: "بمفردي", icon: "🧍" },
  { value: "couple", label: "مع شريك حياتي", icon: "💑" },
  { value: "family", label: "مع العائلة", icon: "👨‍👩‍👧‍👦" },
  { value: "friends", label: "مع الأصدقاء", icon: "🧑‍🤝‍🧑" },
] as const;

const INTEREST_MAP: Record<string, string> = {
  heritage: "🏺",
  safari: "🏜️",
  therapeutic: "🏥",
  nature: "🌿",
};

const TOTAL_STEPS = 5;

export function PlannerWizard({ categories }: { categories: Categories }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    departureCity: DEPARTURE_CITIES[0].value,
    days: 3,
    persons: 1,
    interests: [],
    budget: "",
    companions: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlannerResult | null>(null);
  // Hotel selection: null = not yet chosen, Hotel = confirmed choice
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [hotelConfirmed, setHotelConfirmed] = useState(false);
  // Auth modal for saving
  const [showAuthForSave, setShowAuthForSave] = useState(false);

  function toggleInterest(slug: string) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(slug)
        ? f.interests.filter((i) => i !== slug)
        : [...f.interests, slug],
    }));
  }

  function canProceed() {
    if (step === 1) return form.departureCity !== "" && form.days >= 1;
    if (step === 2) return true; // interests optional
    if (step === 3) return form.budget !== "";
    if (step === 4) return form.companions !== "";
    if (step === 5) return form.persons >= 1;
    return false;
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget: form.budget || "medium",
          companions: form.companions || "solo",
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setResult(data.result);
    } catch {
      setError("حدث خطأ أثناء إنشاء الخطة. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setStep(1);
    setError(null);
    setSelectedHotel(null);
    setHotelConfirmed(false);
  }

  /* ── loading ── */
  if (loading) {
    return (
      <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-sand-200 bg-white p-12 text-center animate-fade-up">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-oasis-100 border-t-oasis-500" />
        <h3 className="font-extrabold text-ink-900">وادينا يخطط رحلتك...</h3>
        <p className="text-sm text-ink-900/60">
          نحلل اهتماماتك ونرتب أفضل مسار ✨
        </p>
      </div>
    );
  }

  /* ── error ── */
  if (error) {
    return (
      <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-10 text-center animate-fade-up">
        <span className="text-3xl">⚠️</span>
        <p className="font-bold text-red-700">{error}</p>
        <button
          onClick={submit}
          className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  /* ── hotel selection ── */
  if (result && !hotelConfirmed) {
    return (
      <HotelSelectionView
        hotels={result.hotelOptions}
        selectedHotel={selectedHotel}
        onSelect={setSelectedHotel}
        onConfirm={() => setHotelConfirmed(true)}
        onSkip={() => setHotelConfirmed(true)}
      />
    );
  }

  /* ── result ── */
  if (result && hotelConfirmed) {
    const resultWithHotel: PlannerResult = { ...result, selectedHotel };
    return (
      <>
        {showAuthForSave && (
          <AuthModal
            onClose={() => setShowAuthForSave(false)}
            reason="سجّل دخولك لحفظ خطة رحلتك"
          />
        )}
        <PlannerResultView
          result={resultWithHotel}
          formInput={form}
          onReset={reset}
          departureCity={form.departureCity}
          user={user}
          onRequestAuth={() => setShowAuthForSave(true)}
        />
      </>
    );
  }

  /* ── wizard ── */
  return (
    <div className="mt-8 animate-fade-up rounded-3xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Progress bar */}
      <div className="mb-8 flex items-center gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < step ? "bg-oasis-500" : "bg-sand-200"
            }`}
          />
        ))}
      </div>

      {/* Step 1 — Departure city + Days */}
      {step === 1 && (
        <StepBlock
          title="من أين ستنطلق؟ وكم يومًا عندك؟"
          subtitle="حدد مدينة البداية وعدد أيام الرحلة"
        >
          <div className="space-y-5">
            {/* Departure city */}
            <div>
              <label className="mb-2 block text-sm font-bold text-ink-900">
                📍 مدينة البداية
              </label>
              <select
                value={form.departureCity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, departureCity: e.target.value }))
                }
                className="w-full rounded-2xl border border-sand-200 bg-white px-4 py-3 text-sm font-bold text-ink-900 shadow-sm focus:border-oasis-400 focus:outline-none"
              >
                {DEPARTURE_CITIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} (~{c.distanceKm} كم)
                  </option>
                ))}
              </select>
            </div>

            {/* Days */}
            <div>
              <label className="mb-2 block text-sm font-bold text-ink-900">
                📅 عدد الأيام
              </label>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() =>
                    setForm((f) => ({ ...f, days: Math.max(1, f.days - 1) }))
                  }
                  className="grid h-12 w-12 place-items-center rounded-full bg-sand-100 text-xl font-extrabold text-ink-900 transition hover:bg-sand-200"
                >
                  −
                </button>
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-oasis-600">
                    {form.days}
                  </div>
                  <div className="text-xs font-bold text-ink-900/50">
                    {form.days === 1 ? "يوم" : "أيام"}
                  </div>
                </div>
                <button
                  onClick={() =>
                    setForm((f) => ({ ...f, days: Math.min(10, f.days + 1) }))
                  }
                  className="grid h-12 w-12 place-items-center rounded-full bg-oasis-500 text-xl font-extrabold text-white transition hover:bg-oasis-600"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </StepBlock>
      )}

      {/* Step 2 — Interests */}
      {step === 2 && (
        <StepBlock
          title="ما نوع الرحلة التي تريدها؟"
          subtitle="يمكنك اختيار أكثر من نوع — أو تركها فارغة لنقترح لك"
        >
          <div className="grid grid-cols-2 gap-3">
            {categories.map((c) => {
              const emoji = INTEREST_MAP[c.slug] ?? c.icon;
              const selected = form.interests.includes(c.slug);
              return (
                <button
                  key={c.slug}
                  onClick={() => toggleInterest(c.slug)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                    selected
                      ? "border-oasis-500 bg-oasis-50 shadow-sm"
                      : "border-sand-200 hover:border-oasis-200"
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-sm font-bold text-ink-900">
                    {c.nameAr}
                  </span>
                </button>
              );
            })}
          </div>
        </StepBlock>
      )}

      {/* Step 3 — Budget */}
      {step === 3 && (
        <StepBlock
          title="ما مستوى ميزانيتك؟"
          subtitle="هذا يؤثر على اختيار الفندق والوسيلة والأنشطة"
        >
          <div className="grid gap-3">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm((f) => ({ ...f, budget: opt.value }))}
                className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-right transition ${
                  form.budget === opt.value
                    ? `${opt.border} ${opt.bg}`
                    : "border-sand-200 hover:border-sand-300"
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span>
                  <span
                    className={`block font-extrabold ${
                      form.budget === opt.value ? opt.color : "text-ink-900"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="block text-xs text-ink-900/50">
                    {opt.desc}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </StepBlock>
      )}

      {/* Step 4 — Companions */}
      {step === 4 && (
        <StepBlock title="مع من ستسافر؟" subtitle="يساعدنا في اختيار الأنشطة المناسبة">
          <div className="grid grid-cols-2 gap-3">
            {COMPANION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm((f) => ({ ...f, companions: opt.value }))}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition ${
                  form.companions === opt.value
                    ? "border-oasis-500 bg-oasis-50"
                    : "border-sand-200 hover:border-oasis-200"
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-sm font-bold text-ink-900">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </StepBlock>
      )}

      {/* Step 5 — Persons */}
      {step === 5 && (
        <StepBlock
          title="كم عدد المسافرين؟"
          subtitle="آخر خطوة — سنبني خطتك فورًا"
        >
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() =>
                setForm((f) => ({ ...f, persons: Math.max(1, f.persons - 1) }))
              }
              className="grid h-12 w-12 place-items-center rounded-full bg-sand-100 text-xl font-extrabold text-ink-900 transition hover:bg-sand-200"
            >
              −
            </button>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-oasis-600">
                {form.persons}
              </div>
              <div className="text-xs font-bold text-ink-900/50">
                {form.persons === 1 ? "شخص" : "أشخاص"}
              </div>
            </div>
            <button
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  persons: Math.min(50, f.persons + 1),
                }))
              }
              className="grid h-12 w-12 place-items-center rounded-full bg-oasis-500 text-xl font-extrabold text-white transition hover:bg-oasis-600"
            >
              +
            </button>
          </div>
          {form.persons >= 10 && (
            <p className="mt-4 text-center text-xs text-terracotta-600 font-semibold">
              🎒 مجموعات كبيرة؟ ننصح بالتواصل مع مكاتب السياحة المحلية لأسعار خاصة.
            </p>
          )}
        </StepBlock>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="rounded-full px-5 py-2.5 text-sm font-bold text-ink-900/60 transition disabled:opacity-0"
        >
          → السابق
        </button>
        {step < TOTAL_STEPS ? (
          <button
            onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
            disabled={!canProceed()}
            className="rounded-full bg-oasis-500 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:bg-oasis-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            التالي ←
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!canProceed()}
            className="rounded-full bg-terracotta-500 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ✨ أنشئ خطتي الآن
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Hotel Selection View
══════════════════════════════════════════════ */
function HotelSelectionView({
  hotels,
  selectedHotel,
  onSelect,
  onConfirm,
  onSkip,
}: {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  onSelect: (h: Hotel) => void;
  onConfirm: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="mt-8 animate-fade-up space-y-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-l from-oasis-600 to-oasis-500 p-6 text-white shadow-lg">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
          خطوة إضافية 🏨
        </span>
        <h2 className="mt-3 text-lg font-extrabold">اختر فندق إقامتك</h2>
        <p className="mt-1 text-sm text-white/80">
          اخترنا لك فنادق مناسبة لميزانيتك في المنطقة — اختر واحدًا ليصبح نقطة انطلاق رحلتك
        </p>
      </div>

      {/* Hotel cards */}
      {hotels.length === 0 ? (
        <div className="rounded-2xl border border-sand-200 bg-sand-50 p-6 text-center text-sm text-ink-900/60">
          لا تتوفر بيانات فنادق لهذه الفئة حاليًا — يمكنك المتابعة بدون اختيار فندق.
        </div>
      ) : (
        <div className="space-y-3">
          {hotels.map((hotel) => {
            const isSelected = selectedHotel?.id === hotel.id;
            return (
              <button
                key={hotel.id}
                onClick={() => onSelect(hotel)}
                className={`w-full rounded-2xl border-2 p-4 text-right transition ${
                  isSelected
                    ? "border-oasis-500 bg-oasis-50 shadow-sm"
                    : "border-sand-200 bg-white hover:border-oasis-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 mt-0.5">{hotel.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-extrabold text-ink-900 text-sm">
                        {hotel.nameAr}
                      </span>
                      <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs font-bold text-ink-900/60">
                        📍 {hotel.oasisNameAr}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-amber-600 font-semibold">
                      {formatStars(hotel.stars)}
                    </p>
                    <p className="mt-1 text-xs text-ink-900/60 leading-relaxed">
                      {hotel.descriptionAr}
                    </p>

                    {!hotel.verified && (
                      <p className="mt-1 text-[10px] text-ink-900/40">
                        ⚠️ يُنصح بالتأكد من السعر والتوفر قبل الحجز
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <span className="shrink-0 rounded-full bg-oasis-500 w-5 h-5 flex items-center justify-center text-white text-xs">
                      ✓
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onConfirm}
          disabled={!selectedHotel && hotels.length > 0}
          className="flex-1 rounded-full bg-oasis-500 px-6 py-3 text-sm font-extrabold text-white shadow transition hover:bg-oasis-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ✨ تأكيد الاختيار وعرض الخطة
        </button>
        <button
          onClick={onSkip}
          className="rounded-full bg-sand-100 px-5 py-3 text-sm font-bold text-ink-900/70 transition hover:bg-sand-200"
        >
          تخطّ
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Step wrapper
══════════════════════════════════════════════ */
function StepBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-up">
      <h2 className="text-lg font-extrabold text-ink-900">{title}</h2>
      <p className="mt-1 text-sm text-ink-900/50">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Result view
══════════════════════════════════════════════ */
function PlannerResultView({
  result,
  formInput,
  onReset,
  departureCity,
  user,
  onRequestAuth,
}: {
  result: PlannerResult;
  formInput: Record<string, unknown>;
  onReset: () => void;
  departureCity?: string;
  user: import("@supabase/supabase-js").User | null;
  onRequestAuth: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    if (!user) { onRequestAuth(); return; }
    setSaving(true);
    setSaveError(null);
    try {
      const title = `رحلة ${result.travelPlan?.departureLabel ?? ""} · ${result.days?.length ?? 0} أيام`;
      const { data, error } = await supabase.from("saved_trips").insert({
        user_id: user.id,
        title,
        summary: result.summary ?? "",
        input: formInput,
        result: result as unknown as Record<string, unknown>,
        selected_hotel: result.selectedHotel as unknown as Record<string, unknown> ?? null,
      }).select("id").single();
      if (error) throw error;
      setSavedId(data.id);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 animate-fade-up space-y-5">
      {/* Hero banner */}
      <div className="rounded-3xl bg-gradient-to-l from-oasis-600 to-oasis-500 p-6 text-white shadow-lg sm:p-8">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
          خطتك جاهزة 🎉
        </span>
        <p className="mt-3 leading-relaxed">{result.summary}</p>
      </div>

      {/* Travel Plan Card */}
      <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm space-y-3">
        <h3 className="font-extrabold text-ink-900 text-base">
          🗺️ خطة الوصول والإقامة
        </h3>

        {/* Route summary: departure → hotel → days */}
        {result.selectedHotel && (
          <div className="rounded-xl bg-oasis-50 border border-oasis-200 p-3 flex items-center gap-2 flex-wrap text-xs font-semibold text-oasis-800">
            <span>📍 {result.travelPlan.departureLabel}</span>
            <span className="text-oasis-400">←</span>
            <span className="font-extrabold text-oasis-700">
              {result.selectedHotel.icon} {result.selectedHotel.nameAr}
            </span>
            <span className="text-oasis-400">←</span>
            <span>اليوم الأول ← اليوم الثاني ← بقية الأيام</span>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-3">
          {/* Transport */}
          <div className="rounded-xl bg-sand-50 p-3">
            <p className="text-xs font-bold text-ink-900/50 mb-1">وسيلة التنقل</p>
            <p className="text-sm font-extrabold text-ink-900">
              {result.travelPlan.transport.icon}{" "}
              {result.travelPlan.transport.label}
            </p>
            <p className="text-xs text-ink-900/60 mt-1">
              {result.travelPlan.transport.desc}
            </p>
          </div>
          {/* Hotel — selected or generic suggestion */}
          <div className={`rounded-xl p-3 ${result.selectedHotel ? "bg-oasis-50 border border-oasis-200" : "bg-sand-50"}`}>
            <p className="text-xs font-bold text-ink-900/50 mb-1">
              {result.selectedHotel ? "فندق إقامتك المختار" : "الإقامة المقترحة"}
            </p>
            {result.selectedHotel ? (
              <>
                <p className="text-sm font-extrabold text-oasis-800">
                  {result.selectedHotel.icon} {result.selectedHotel.nameAr}
                </p>
                <p className="text-xs text-amber-600 font-semibold mt-0.5">
                  {formatStars(result.selectedHotel.stars)} · {result.selectedHotel.oasisNameAr}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-extrabold text-ink-900">
                  {result.travelPlan.hotel.icon} {result.travelPlan.hotel.tier}
                </p>
              </>
            )}
          </div>
          {/* Arrival note */}
          <div className="rounded-xl bg-sand-50 p-3">
            <p className="text-xs font-bold text-ink-900/50 mb-1">ملاحظة الوصول</p>
            <p className="text-xs text-ink-900/70 leading-relaxed">
              {result.travelPlan.arrivalNote}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-ink-900/40 pt-1">
          ⚠️ التفاصيل تقريبية — يُنصح بالتحقق من الجداول والأسعار الفعلية قبل السفر.
        </p>
      </div>

      {/* Advice */}
      <div className="grid gap-3 sm:grid-cols-2">
        <AdviceCard icon="🌡️" title="نصيحة الموسم" text={result.seasonAdvice} />
        <AdviceCard icon="💰" title="نصيحة الميزانية" text={result.budgetAdvice} />
      </div>

      {/* Map — shown when GPS coords are available */}
      {result.mapReady && <ItineraryMap days={result.days} departureLabel={result.travelPlan.departureLabel} departureCity={departureCity} />}

      {/* Days */}
      <div className="space-y-4">
        {result.days.map((day) => (
          <div
            key={day.day}
            className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-ink-900">{day.title}</h3>
              <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-bold text-ink-900/60">
                📍 {day.cityNameAr}
              </span>
            </div>
            <div className="space-y-2">
              {day.items.map((item, i) => (
                <Link
                  href={`/explore/${item.attraction.slug}`}
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-sand-100 p-3 transition hover:border-oasis-200 hover:bg-oasis-50/40"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.attraction.imageUrl}
                      alt={item.attraction.nameAr}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-terracotta-600">
                      {item.timeOfDay}
                    </span>
                    <p className="font-bold text-ink-900 truncate">
                      {item.attraction.nameAr}
                    </p>
                    <p className="text-[11px] text-ink-900/50">
                      ⭐ {item.attraction.rating} ·{" "}
                      {item.attraction.categoryNameAr}
                      {item.gps && (
                        <span className="ml-2 text-oasis-600">📍 GPS متاح</span>
                      )}
                    </p>
                  </div>
                  <span className="text-ink-900/30 shrink-0">←</span>
                </Link>
              ))}
            </div>
            <p className="mt-3 rounded-xl bg-terracotta-500/5 p-3 text-xs font-semibold text-terracotta-600">
              💡 {day.tip}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-1 items-center">
        {/* Save button */}
        {savedId ? (
          <Link
            href={`/my-trips/${savedId}`}
            className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-emerald-700"
          >
            ✅ تم الحفظ — عرض الرحلة
          </Link>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-terracotta-500 px-6 py-3 text-sm font-extrabold text-white shadow transition hover:bg-terracotta-600 disabled:opacity-50"
          >
            {saving ? "جارٍ الحفظ..." : "💾 احفظ الرحلة"}
          </button>
        )}

        <button
          onClick={onReset}
          className="rounded-full bg-oasis-500 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-oasis-600"
        >
          🔄 إنشاء خطة جديدة
        </button>
        <Link
          href="/products"
          className="rounded-full bg-sand-100 px-6 py-3 text-sm font-bold text-ink-900 transition hover:bg-sand-200"
        >
          🧺 منتجات مقترحة لرحلتك
        </Link>

        {saveError && (
          <p className="w-full text-xs font-bold text-red-600">⚠️ {saveError}</p>
        )}
        {!user && (
          <p className="w-full text-xs text-ink-900/50">
            سجّل دخولك لحفظ الرحلة والعودة إليها لاحقاً.{" "}
            <button onClick={onRequestAuth} className="text-oasis-600 underline font-bold">
              تسجيل الدخول
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

function AdviceCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
      <h4 className="flex items-center gap-2 font-extrabold text-ink-900">
        {icon} {title}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-ink-900/70">{text}</p>
    </div>
  );
}
