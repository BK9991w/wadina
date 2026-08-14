"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "@/lib/favorites-context";
import { FavoriteButton } from "@/components/FavoriteButton";
import type { AttractionListItem } from "@/lib/queries";

export default function FavoritesPage() {
  const { favorites, ready } = useFavorites();
  const [items, setItems] = useState<AttractionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (favorites.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/attractions?ids=${favorites.join(",")}`)
      .then((res) => res.json())
      .then((data) => setItems(data.attractions ?? []))
      .finally(() => setLoading(false));
  }, [favorites, ready]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="animate-fade-up text-center">
        <span className="text-xs font-extrabold uppercase tracking-wide text-oasis-600">قائمتك الشخصية</span>
        <h1 className="mt-2 text-2xl font-extrabold text-ink-900 sm:text-3xl">أماكنك المفضلة</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-900/60">
          تُحفظ المفضلة على جهازك مباشرة دون الحاجة لإنشاء حساب.
        </p>
      </div>

      {!ready || loading ? (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-sand-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-sand-300 bg-white py-16 text-center">
          <div className="relative h-40 w-40">
            <div className="flex h-full w-full items-center justify-center text-6xl">❤️</div>
          </div>
          <h3 className="text-lg font-extrabold text-ink-900">لم تُضف أي مكان بعد</h3>
          <p className="max-w-sm text-sm text-ink-900/60">
            تصفح المعالم واضغط على أيقونة القلب لحفظها هنا لتخطيط رحلتك لاحقًا.
          </p>
          <Link
            href="/explore"
            className="rounded-full bg-oasis-500 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-oasis-600"
          >
            🧭 ابدأ الاستكشاف
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <Link
              key={a.id}
              href={`/explore/${a.slug}`}
              className="animate-fade-up group flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-40 w-full">
                <Image src={a.imageUrl} alt={a.nameAr} fill className="object-cover transition group-hover:scale-110" />
                <div className="absolute inset-x-0 top-0 flex justify-end p-2.5">
                  <FavoriteButton id={a.id} />
                </div>
              </div>
              <div className="p-4">
                <span className="text-xs font-bold text-ink-900/50">📍 {a.cityNameAr}</span>
                <h3 className="mt-1 font-extrabold text-ink-900">{a.nameAr}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
