import Image from "next/image";
import { getLocalProducts } from "@/lib/queries";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, { label: string; color: string }> = {
  food: { label: "منتج غذائي", color: "#B9622B" },
  craft: { label: "حرفة يدوية", color: "#0E7C7B" },
  textile: { label: "منسوجات", color: "#3F8F6B" },
  beauty: { label: "عناية طبيعية", color: "#C1863B" },
};

export default async function ProductsPage() {
  const products = await getLocalProducts();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="animate-fade-up text-center">
        <span className="text-xs font-extrabold uppercase tracking-wide text-oasis-600">اقتصاد الواحة</span>
        <h1 className="mt-2 text-2xl font-extrabold text-ink-900 sm:text-3xl">منتجات محلية أصيلة من الوادي الجديد</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-900/60">
          كل عملية شراء تدعم الحرفيين والمزارعين المحليين، وتساهم في الحفاظ على تراث الواحات الثقافي والاقتصادي.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => {
          const meta = CATEGORY_LABEL[p.category] ?? { label: p.category, color: "#0E7C7B" };
          return (
            <div
              key={p.id}
              className="animate-fade-up flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="relative h-44 w-full">
                <Image src={p.imageUrl} alt={p.nameAr} fill className="object-cover" />
                <span
                  className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.label}
                </span>
                {p.isFeatured && (
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-terracotta-600 shadow">
                    ⭐ الأكثر طلبًا
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-base font-extrabold text-ink-900">{p.nameAr}</h3>
                <p className="flex-1 text-sm leading-relaxed text-ink-900/70">{p.descriptionAr}</p>
                <div className="mt-2 space-y-1.5 border-t border-sand-100 pt-3 text-xs text-ink-900/60">
                  <p>💵 السعر التقريبي: <span className="font-bold text-ink-900">{p.priceRangeAr}</span></p>
                  <p>🛍️ أين تجده: <span className="font-bold text-ink-900">{p.whereToBuyAr}</span></p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Footer />
    </main>
  );
}
