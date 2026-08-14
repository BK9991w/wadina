import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAttractionBySlug, getAttractions } from "@/lib/queries";
import { FavoriteButton } from "@/components/FavoriteButton";
import { AttractionCard } from "@/components/AttractionCard";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";

export const dynamic = "force-dynamic";

const PRICE_LABEL: Record<string, string> = {
  free: "مجانًا",
  low: "اقتصادي",
  medium: "متوسط",
  high: "مرتفع",
};

export default async function AttractionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const attraction = await getAttractionBySlug(slug);
  if (!attraction) notFound();

  const all = await getAttractions();
  const related = all
    .filter((a) => a.id !== attraction.id && (a.categorySlug === attraction.categorySlug || a.citySlug === attraction.citySlug))
    .slice(0, 3);

  return (
    <main>
      <div className="relative h-72 w-full overflow-hidden sm:h-96">
        <Image src={attraction.imageUrl} alt={attraction.nameAr} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
        <div className="absolute inset-x-0 top-4 mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
          <BackButton fallback="/explore" />
          <FavoriteButton id={attraction.id} />
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-6 text-white sm:px-6">
          <span
            className="rounded-full px-3 py-1 text-xs font-bold shadow"
            style={{ backgroundColor: attraction.categoryColor }}
          >
            {attraction.categoryIcon} {attraction.categoryNameAr}
          </span>
          <h1 className="mt-3 text-2xl font-extrabold sm:text-4xl">{attraction.nameAr}</h1>
          <p className="mt-1 text-sm text-white/85">📍 {attraction.cityNameAr} — الوادي الجديد</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="animate-fade-up md:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoChip icon="⭐" label="التقييم" value={String(attraction.rating)} />
            <InfoChip icon="💵" label="التكلفة" value={PRICE_LABEL[attraction.priceLevel] ?? attraction.priceLevel} />
            <InfoChip icon="⏱️" label="المدة" value={`${attraction.durationHours} ساعة`} />
            <InfoChip icon="📅" label="أفضل وقت" value={attraction.bestSeasonAr} small />
          </div>

          <h2 className="mt-8 text-lg font-extrabold text-ink-900">عن هذا المكان</h2>
          <p className="mt-3 leading-loose text-ink-900/75">{attraction.descriptionAr}</p>

          <h2 className="mt-8 text-lg font-extrabold text-ink-900">أبرز ما يميزه</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {attraction.highlights?.map((h, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-xl bg-oasis-50 px-4 py-3 text-sm font-semibold text-oasis-700"
              >
                ✓ {h}
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl border border-terracotta-400/30 bg-terracotta-500/5 p-5">
            <h3 className="flex items-center gap-2 font-extrabold text-terracotta-600">💡 نصيحة وادينا</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-900/75">{attraction.tipsAr}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {attraction.tags?.map((t) => (
              <span key={t} className="rounded-full bg-sand-100 px-3 py-1 text-xs font-bold text-ink-900/60">
                #{t}
              </span>
            ))}
          </div>
        </div>

        <aside className="animate-fade-up h-fit rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <h3 className="font-extrabold text-ink-900">📍 عن {attraction.cityNameAr}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-900/70">{attraction.cityDescriptionAr}</p>
          <Link
            href={`/explore?city=${attraction.citySlug}`}
            className="mt-4 block rounded-full bg-oasis-50 py-2.5 text-center text-sm font-bold text-oasis-600 transition hover:bg-oasis-100"
          >
            استكشف معالم {attraction.cityNameAr} الأخرى
          </Link>
          <Link
            href="/planner"
            className="mt-3 block rounded-full bg-terracotta-500 py-2.5 text-center text-sm font-bold text-white shadow transition hover:bg-terracotta-600"
          >
            ✨ أضِف هذا المكان لخطة رحلتك
          </Link>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-xl font-extrabold text-ink-900">قد يعجبك أيضًا</h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a, i) => (
                <AttractionCard key={a.id} attraction={a} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

function InfoChip({ icon, label, value, small }: { icon: string; label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-xl bg-sand-100 p-3 text-center">
      <div className="text-lg">{icon}</div>
      <div className={`mt-1 font-extrabold text-ink-900 ${small ? "text-[11px] leading-tight" : "text-sm"}`}>
        {value}
      </div>
      <div className="text-[10px] text-ink-900/50">{label}</div>
    </div>
  );
}
