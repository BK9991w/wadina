"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "الرئيسية", icon: "🏠" },
  { href: "/explore", label: "استكشف", icon: "🧭" },
  { href: "/planner", label: "الخطة", icon: "✨" },
  { href: "/products", label: "منتجات", icon: "🧺" },
  { href: "/favorites", label: "مفضلة", icon: "❤️" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-white/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-6xl items-stretch justify-between px-2">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${
                active ? "text-oasis-600" : "text-ink-900/50"
              }`}
            >
              <span className={`text-lg transition ${active ? "scale-110" : ""}`}>{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
