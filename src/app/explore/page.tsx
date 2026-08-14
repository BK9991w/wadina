import { getAttractions, getCategories, getCities } from "@/lib/queries";
import { AttractionCard } from "@/components/AttractionCard";
import { Footer } from "@/components/Footer";
import { ExploreFilters } from "./ExploreFilters";

export const dynamic = "force-dynamic";

type SearchParams = { category?: string; city?: string; q?: string };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, city, q } = await searchParams;
  const [attractions, categories, cities] = await Promise.all([
    getAttractions(),
    getCategories(),
    getCities(),
  ]);

  const query = (q ?? "").trim().toLowerCase();
  const filtered = attractions.filter((a) => {
    if (category && a.categorySlug !== category) return false;
    if (city && a.citySlug !== city) return false;
    if (query) {
      const haystack = `${a.nameAr} ${a.shortDescriptionAr} ${a.tags?.join(" ")}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="animate-fade-up">
        <span className="text-xs font-extrabold uppercase tracking-wide text-oasis-600">استكشف الوادي الجديد</span>
        <h1 className="mt-2 text-2xl font-extrabold text-ink-900 sm:text-3xl">
          {filtered.length} معلمًا سياحيًا بانتظار اكتشافك
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-900/60">
          ابحث أو صفِّ النتائج حسب نوع السياحة أو المدينة للعثور على ما يناسب رحلتك بالضبط.
        </p>
      </div>

      <ExploreFilters
        categories={categories}
        cities={cities}
        activeCategory={category}
        activeCity={city}
        activeQuery={q ?? ""}
      />

      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-sand-300 bg-white py-16 text-center">
          <span className="text-4xl">🏜️</span>
          <h3 className="text-lg font-extrabold text-ink-900">لا توجد نتائج مطابقة</h3>
          <p className="max-w-sm text-sm text-ink-900/60">
            جرّب كلمة بحث مختلفة أو أزل بعض الفلاتر لاستكشاف مزيد من معالم الوادي الجديد.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a, i) => (
            <AttractionCard key={a.id} attraction={a} index={i} />
          ))}
        </div>
      )}

      <Footer />
    </main>
  );
}
