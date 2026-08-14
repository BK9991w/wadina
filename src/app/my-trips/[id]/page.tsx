"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { supabase, type SavedTrip } from "@/lib/supabase";
import { AuthModal } from "@/components/AuthModal";
import { formatStars } from "@/lib/hotels";
import { BackButton } from "@/components/BackButton";
import { TripCompanionChat } from "@/components/TripCompanionChat";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [trip, setTrip] = useState<SavedTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [liveTrip, setLiveTrip] = useState<import("@/types/ai").Trip | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    fetchTrip();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, id]);

  async function fetchTrip() {
    setLoading(true);
    const { data, error } = await supabase
      .from("saved_trips")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) {
      setTrip(data as SavedTrip);
      const r = (data as SavedTrip).result as unknown as import("@/types/ai").Trip;
      if (r?.days) setLiveTrip(r);
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("هل أنت متأكد من حذف هذه الرحلة؟")) return;
    setDeleting(true);
    await supabase.from("saved_trips").delete().eq("id", id);
    router.push("/my-trips");
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ar-EG", {
      year: "numeric", month: "long", day: "numeric",
    });
  }

  /* ── Auth loading ── */
  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-oasis-200 border-t-oasis-500" />
      </main>
    );
  }

  /* ── Not logged in ── */
  if (!user) {
    return (
      <>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} reason="سجّل دخولك لعرض رحلاتك" />}
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-xl font-extrabold text-ink-900">يجب تسجيل الدخول أولاً</h1>
          <button
            onClick={() => setShowAuth(true)}
            className="mt-6 rounded-full bg-oasis-500 px-8 py-3 text-sm font-extrabold text-white shadow"
          >
            تسجيل الدخول
          </button>
        </main>
      </>
    );
  }

  /* ── Trip not found ── */
  if (!trip) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h1 className="text-xl font-extrabold text-ink-900">الرحلة غير موجودة</h1>
        <p className="mt-2 text-sm text-ink-900/60">ربما تم حذفها أو أنها تعود لمستخدم آخر.</p>
        <Link href="/my-trips" className="mt-6 inline-block rounded-full bg-oasis-500 px-8 py-3 text-sm font-extrabold text-white shadow">
          العودة لرحلاتي
        </Link>
      </main>
    );
  }

  const result = trip.result as Record<string, unknown>;
  const days = (result.days as Record<string, unknown>[]) ?? [];
  const travelPlan = result.travelPlan as Record<string, unknown> | null;
  const seasonAdvice = result.seasonAdvice as string | null;
  const hotel = trip.selected_hotel as Record<string, unknown> | null;
  const input = trip.input as Record<string, unknown>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-5">
      {/* Back + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <BackButton fallback="/my-trips" />
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
        >
          {deleting ? "جارٍ الحذف..." : "حذف الرحلة 🗑️"}
        </button>
      </div>

      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-l from-oasis-600 to-oasis-500 p-6 text-white shadow-lg">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
          ✈️ رحلة محفوظة
        </span>
        <h1 className="mt-3 text-xl font-extrabold">{trip.title}</h1>
        <p className="mt-2 text-sm leading-relaxed opacity-90">{trip.summary}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs opacity-70 font-semibold">
          <span>📅 {formatDate(trip.created_at)}</span>
          {days.length > 0 && <span>🗓️ {days.length} {days.length === 1 ? "يوم" : "أيام"}</span>}
          {!!input.companions && (
            <span>{input.companions === "solo" ? "🧍 بمفردي" : input.companions === "couple" ? "💑 مع شريك" : input.companions === "family" ? "👨‍👩‍👧‍👦 مع العائلة" : "🧑‍🤝‍🧑 مع أصدقاء"}</span>
          )}
          {!!input.budget && (
            <span>{input.budget === "economic" ? "🟢 اقتصادية" : input.budget === "medium" ? "🔵 متوسطة" : "🟡 مميزة"}</span>
          )}
        </div>
      </div>

      {/* Travel Plan */}
      {travelPlan && (
        <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="font-extrabold text-ink-900">🗺️ خطة الوصول والإقامة</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {/* Transport */}
            {!!travelPlan.transport && (
              <div className="rounded-xl bg-sand-50 p-3">
                <p className="text-xs font-bold text-ink-900/50 mb-1">وسيلة التنقل</p>
                <p className="text-sm font-extrabold text-ink-900">
                  {String((travelPlan.transport as Record<string,string>).icon ?? "")}{" "}
                  {String((travelPlan.transport as Record<string,string>).label ?? "")}
                </p>
                <p className="text-xs text-ink-900/60 mt-1">
                  {String((travelPlan.transport as Record<string,string>).desc ?? "")}
                </p>
              </div>
            )}
            {/* Hotel */}
            {hotel && (
              <div className="rounded-xl bg-oasis-50 border border-oasis-200 p-3">
                <p className="text-xs font-bold text-ink-900/50 mb-1">فندق الإقامة</p>
                <p className="text-sm font-extrabold text-oasis-800">
                  {String(hotel.icon ?? "🏨")} {String(hotel.nameAr ?? "")}
                </p>
                <p className="text-xs text-amber-600 font-semibold mt-0.5">
                  {formatStars(Number(hotel.stars ?? 3))} · {String(hotel.oasisNameAr ?? "")}
                </p>
              </div>
            )}
          </div>
          {!!travelPlan.arrivalNote && (
            <p className="text-xs text-ink-900/60 rounded-xl bg-sand-50 p-3">
              ℹ️ {String(travelPlan.arrivalNote ?? "")}
            </p>
          )}
        </div>
      )}

      {/* Season Advice */}
      {seasonAdvice && (
        <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-extrabold text-ink-900">🌡️ نصيحة الموسم</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-900/70">{seasonAdvice}</p>
        </div>
      )}

      {/* Days */}
      {days.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-extrabold text-ink-900 text-base">📅 تفاصيل الأيام</h2>
          {days.map((day, idx) => {
            const items = (day.items as Record<string, unknown>[]) ?? [];
            return (
              <div key={idx} className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-ink-900">{String(day.title ?? `اليوم ${idx + 1}`)}</h3>
                  {!!day.cityNameAr && (
                    <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-bold text-ink-900/60">
                      📍 {String(day.cityNameAr ?? "")}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => {
                    const attr = item.attraction as Record<string, unknown>;
                    return (
                      <Link
                        href={`/explore/${String(attr?.slug ?? "")}`}
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-sand-100 p-3 transition hover:border-oasis-200 hover:bg-oasis-50/40"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                          {!!attr?.imageUrl && (
                            <Image
                              src={String(attr.imageUrl)}
                              alt={String(attr.nameAr ?? "")}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-bold text-terracotta-600">
                            {String(item.timeOfDay ?? "")}
                          </span>
                          <p className="font-bold text-ink-900 truncate">{String(attr?.nameAr ?? "")}</p>
                          <p className="text-[11px] text-ink-900/50">
                            ⭐ {String(attr?.rating ?? "")} · {String(attr?.categoryNameAr ?? "")}
                          </p>
                        </div>
                        <span className="text-ink-900/30 shrink-0">←</span>
                      </Link>
                    );
                  })}
                </div>
                {!!day.tip && (
                  <p className="mt-3 rounded-xl bg-terracotta-500/5 p-3 text-xs font-semibold text-terracotta-600">
                    💡 {String(day.tip ?? "")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex flex-wrap gap-3 pb-6">
        <Link href="/planner" className="rounded-full bg-oasis-500 px-6 py-3 text-sm font-bold text-white shadow hover:bg-oasis-600">
          ✨ خطط رحلة جديدة
        </Link>
        <Link href="/my-trips" className="rounded-full bg-sand-100 px-6 py-3 text-sm font-bold text-ink-900 hover:bg-sand-200">
          رحلاتي المحفوظة ✈️
        </Link>
      </div>

      {/* مساعد الرحلة — بوت عائم مرتبط بهذه الرحلة */}
      {liveTrip && (
        <TripCompanionChat
          trip={liveTrip}
          onTripChange={(updated) => setLiveTrip(updated)}
        />
      )}
    </main>
  );
}
