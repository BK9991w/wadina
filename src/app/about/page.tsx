import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="animate-fade-up text-center">
        <span className="text-xs font-extrabold uppercase tracking-wide text-oasis-600">لماذا وادينا؟</span>
        <h1 className="mt-2 text-2xl font-extrabold text-ink-900 sm:text-3xl">القصة وراء المشروع</h1>
      </div>

      <div className="mt-10 space-y-6 rounded-3xl border border-sand-200 bg-white p-6 shadow-sm sm:p-10">
        <Quote>
          "الإجازة قربت... عايز أروح الوادي الجديد... بس للأمانة مش عارف حاجة عنها."
        </Quote>
        <Quote reverse>"جد؟ ولا أنا."</Quote>
        <p className="leading-loose text-ink-900/75">
          هنا تبدأ المشكلة: رغم أن محافظة الوادي الجديد تمتلك كنوزًا سياحية وتراثية استثنائية — من معابد
          فرعونية ومدن إسلامية أثرية، إلى صحراء بيضاء ساحرة وعيون علاجية طبيعية — إلا أن كثيرًا من الناس
          لا يعرفون عنها شيئًا، ولا يعرفون من أين يبدأون التخطيط لزيارتها.
        </p>
        <p className="leading-loose text-ink-900/75">
          <strong className="text-ink-900">وادينا</strong> جاء ليكون الحل: منصة ذكية تُعرّف الزائر بمعالم
          الوادي الجديد بطريقة شيقة وموثوقة، وتضعه في قلب تجربة تخطيط رحلة كاملة خلال دقائق، بدلًا من ساعات
          البحث المشتت بين مصادر غير موثوقة.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        <ValueCard icon="🎯" title="مهمتنا" text="تحويل الفضول إلى رحلة فعلية عبر محتوى غني وتخطيط ذكي." />
        <ValueCard icon="🧭" title="رؤيتنا" text="أن يكون الوادي الجديد أول وجهة تخطر ببال أي مسافر مصري يبحث عن تجربة مختلفة." />
        <ValueCard icon="🤝" title="أثرنا" text="ربط السائح بالحرفيين والمرشدين المحليين لدعم اقتصاد الواحة." />
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-l from-oasis-600 to-oasis-500 p-8 text-center text-white">
        <div className="relative h-24 w-24">
          <Image src="https://images.pexels.com/photos/18742776/pexels-photo-18742776.jpeg?auto=compress&cs=tinysrgb&w=600" alt="وادينا" fill className="object-contain" />
        </div>
        <h2 className="text-xl font-extrabold">هل أنت مستعد لاكتشاف الوادي الجديد؟</h2>
        <Link
          href="/planner"
          className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-oasis-600 shadow transition hover:-translate-y-0.5"
        >
          ابدأ التخطيط الآن ⟵
        </Link>
      </div>

      <Footer />
    </main>
  );
}

function Quote({ children, reverse }: { children: React.ReactNode; reverse?: boolean }) {
  return (
    <div className={`flex ${reverse ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-md rounded-2xl px-5 py-3 text-sm font-semibold leading-relaxed ${
          reverse ? "bg-oasis-50 text-oasis-700" : "bg-sand-100 text-ink-900"
        }`}
      >
        {children}
      </p>
    </div>
  );
}

function ValueCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="animate-fade-up rounded-2xl border border-sand-200 bg-white p-6 text-center shadow-sm">
      <span className="text-2xl">{icon}</span>
      <h3 className="mt-2 font-extrabold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-900/60">{text}</p>
    </div>
  );
}
