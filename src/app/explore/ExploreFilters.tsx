"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import type { getCategories, getCities } from "@/lib/queries";

type Props = {
  categories: Awaited<ReturnType<typeof getCategories>>;
  cities: Awaited<ReturnType<typeof getCities>>;
  activeCategory?: string;
  activeCity?: string;
  activeQuery: string;
};

export function ExploreFilters({ categories, cities, activeCategory, activeCity, activeQuery }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(activeQuery);
  const [, startTransition] = useTransition();

  function updateParam(key: string, value?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || (key === "category" && value === activeCategory) || (key === "city" && value === activeCity)) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mt-6 space-y-4">
      <form onSubmit={submitSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن معلم، مدينة، أو نشاط... مثال: صحراء، آثار، علاجي"
          className="w-full rounded-full border border-sand-300 bg-white px-5 py-3 text-sm shadow-sm outline-none transition focus:border-oasis-400 focus:ring-2 focus:ring-oasis-100"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-oasis-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-oasis-600"
        >
          🔍 بحث
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <FilterPill
          label="الكل"
          active={!activeCategory}
          onClick={() => updateParam("category", undefined)}
        />
        {categories.map((c) => (
          <FilterPill
            key={c.slug}
            label={`${c.icon} ${c.nameAr}`}
            active={activeCategory === c.slug}
            onClick={() => updateParam("category", c.slug)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill
          label="كل المدن"
          active={!activeCity}
          onClick={() => updateParam("city", undefined)}
          variant="secondary"
        />
        {cities.map((c) => (
          <FilterPill
            key={c.slug}
            label={`📍 ${c.nameAr}`}
            active={activeCity === c.slug}
            onClick={() => updateParam("city", c.slug)}
            variant="secondary"
          />
        ))}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  variant = "primary",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  const activeClass =
    variant === "primary" ? "bg-oasis-500 text-white shadow-sm" : "bg-terracotta-500 text-white shadow-sm";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-bold transition ${
        active ? activeClass : "bg-white text-ink-900/70 ring-1 ring-sand-200 hover:bg-sand-100"
      }`}
    >
      {label}
    </button>
  );
}
