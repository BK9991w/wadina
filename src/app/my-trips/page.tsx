"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase, type SavedTrip } from "@/lib/supabase";
import { AuthModal } from "@/components/AuthModal";

export default function MyTripsPage() {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchTrips();
  }, [user]);

  async function fetchTrips() {
    setLoading(true);
    const { data, error } = await supabase
      .from("saved_trips")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setTrips(data as SavedTrip[]);
    setLoading(false);
  }

  async function deleteTrip(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الرحلة؟")) return;
    setDeletingId(id);
    await supabase.from("saved_trips").delete().eq("id", id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (authLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-oasis-200 border-t-oasis-500" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            reason="سجّل دخولك لعرض رحلاتك المحفوظة"
          />
        )}
        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 text-center">
          <div className="mx-auto mb-6 text-7xl">🗺️</div>
          <h1 className="text-2xl font-extrabold text-ink-900">رحلاتي</h1>
          <p className="mt-3 text-sm text-ink-900/60">
            سجّل دخولك لعرض رحلاتك المحفوظة والمتابعة من حيث توقفت.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="mt-6 rounded-full bg-oasis-500 px-8 py-3 text-sm font-extrabold text-white shadow transition hover:bg-oasis-600"
          >
            تسجيل الدخول
          </button>
          <p className="mt-4 text-xs text-ink-900/40">
            ليس لديك حساب؟{" "}
            <button
              onClick={() => setShowAuth(true)}
              className="text-oasis-600 underline font-semibold"
            >
              أنشئ حساباً مجانياً
            </button>
          </p>
        </main>
      </>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wide text-oasis-600">
            حسابك الشخصي
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-ink-900">
            رحلاتي المحفوظة
          </h1>
        </div>
        <Link
          href="/planner"
          className="rounded-full bg-oasis-500 px-5 py-2.5 text-xs font-extrabold text-white shadow transition hover:bg-oasis-600"
        >
          ✨ رحلة جديدة
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-sand-100"
            />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-sand-300 bg-white py-16 text-center">
          <div className="mx-auto mb-4 text-6xl">✈️</div>
          <h3 className="text-lg font-extrabold text-ink-900">
            لا توجد رحلات محفوظة بعد
          </h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-ink-900/60">
            خطّط رحلتك الأولى واحفظها هنا لتتابعها في أي وقت.
          </p>
          <Link
            href="/planner"
            className="mt-6 inline-block rounded-full bg-oasis-500 px-8 py-3 text-sm font-extrabold text-white shadow transition hover:bg-oasis-600"
          >
            ✨ خطّط رحلة الآن
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => {
            const result = trip.result as Record<string, unknown>;
            const daysCount = (result.days as unknown[])?.length ?? 0;
            const hotel = trip.selected_hotel as
              | Record<string, unknown>
              | null;

            return (
              <div
                key={trip.id}
                className="group rounded-2xl border border-sand-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-extrabold text-ink-900 text-base">
                        {trip.title}
                      </h2>
                      {daysCount > 0 && (
                        <span className="rounded-full bg-oasis-50 px-2.5 py-0.5 text-[11px] font-bold text-oasis-700">
                          {daysCount}{" "}
                          {daysCount === 1 ? "يوم" : "أيام"}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-ink-900/60 line-clamp-2">
                      {trip.summary}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-ink-900/50 font-semibold">
                      <span>📅 {formatDate(trip.created_at)}</span>
                      {hotel && (
                        <span>
                          🏨{" "}
                          {String(hotel.nameAr ?? "فندق مختار")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      href={`/my-trips/${trip.id}`}
                      className="rounded-full bg-oasis-500 px-4 py-1.5 text-xs font-extrabold text-white shadow transition hover:bg-oasis-600"
                    >
                      عرض ✈️
                    </Link>
                    <button
                      onClick={() => deleteTrip(trip.id)}
                      disabled={deletingId === trip.id}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {deletingId === trip.id ? "..." : "حذف 🗑️"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
