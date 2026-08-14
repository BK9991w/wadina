import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-sand-200 bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-oasis-500 text-white">🌴</span>
              <span className="text-lg font-extrabold">وادينا</span>
            </div>
            <p className="text-sm leading-relaxed text-ink-900/60">
              مشروع طلابي يهدف لتعريف الزوار بكنوز محافظة الوادي الجديد المخفية عبر تجربة رقمية ذكية وسهلة.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-extrabold text-ink-900">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-ink-900/60">
              <li><Link href="/explore" className="hover:text-oasis-600">استكشف المعالم</Link></li>
              <li><Link href="/planner" className="hover:text-oasis-600">خطط رحلتك بالذكاء الاصطناعي</Link></li>
              <li><Link href="/products" className="hover:text-oasis-600">المنتجات المحلية</Link></li>
              <li><Link href="/about" className="hover:text-oasis-600">عن المشروع</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-extrabold text-ink-900">الوادي الجديد بالأرقام</h4>
            <ul className="space-y-2 text-sm text-ink-900/60">
              <li>🗺️ أكبر محافظة مصرية مساحةً</li>
              <li>🏝️ 3 واحات رئيسية</li>
              <li>🏛️ +15 معلمًا سياحيًا وتراثيًا</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-sand-200 pt-6 text-center text-xs text-ink-900/40">
          صُنع بشغف من فريق طلابي © {new Date().getFullYear()} — مشروع تخرج تنافسي لدعم السياحة في الوادي الجديد
        </p>
      </div>
    </footer>
  );
}
