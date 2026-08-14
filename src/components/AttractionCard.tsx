import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "./FavoriteButton";
import type { AttractionListItem } from "@/lib/queries";

const PRICE_LABEL: Record<string, string> = {
  free: "مجانًا",
  low: "اقتصادي",
  medium: "متوسط",
  high: "مرتفع",
};

export function AttractionCard({ attraction, index = 0 }: { attraction: AttractionListItem; index?: number }) {
  return (
    <Link
      href={`/explore/${attraction.slug}`}
      className="group animate-fade-up flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative h-44 w-full overflow-hidden bg-sand-100">
        <Image
          src={attraction.imageUrl}
          alt={attraction.nameAr}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-bold text-white shadow"
            style={{ backgroundColor: attraction.categoryColor }}
          >
            {attraction.categoryIcon} {attraction.categoryNameAr}
          </span>
          <FavoriteButton id={attraction.id} />
        </div>
        {attraction.isFeatured && (
          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-terracotta-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
            ⭐ الأكثر تميزًا
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-900/50">
          <span>📍 {attraction.cityNameAr}</span>
          <span>⭐ {attraction.rating}</span>
        </div>
        <h3 className="text-base font-extrabold text-ink-900">{attraction.nameAr}</h3>
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-ink-900/70">
          {attraction.shortDescriptionAr}
        </p>
        <div className="mt-1 flex items-center justify-between text-xs font-bold">
          <span className="rounded-full bg-oasis-50 px-2.5 py-1 text-oasis-600">
            {PRICE_LABEL[attraction.priceLevel] ?? attraction.priceLevel}
          </span>
          <span className="text-ink-900/50">⏱ {attraction.durationHours} ساعة</span>
        </div>
      </div>
    </Link>
  );
}
