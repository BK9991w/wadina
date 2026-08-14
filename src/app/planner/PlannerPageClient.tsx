"use client";

import { useState } from "react";
import type { getCategories } from "@/lib/queries";
import { PlannerWizard } from "./PlannerWizard";
import { ChatPanel } from "@/components/ChatPanel";
import { Footer } from "@/components/Footer";
import type { Trip } from "@/types/ai";

type Props = {
  categories: Awaited<ReturnType<typeof getCategories>>;
};

export function PlannerPageClient({ categories }: Props) {
  const [tab, setTab] = useState<"chat" | "wizard">("chat");
  // Shared trip state — both tabs see the same trip
  const [trip, setTrip] = useState<Trip | undefined>();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 pb-28 sm:px-6 md:pb-10">
      {/* Header */}
      <div className="animate-fade-up flex flex-col items-center gap-3 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-oasis-50 text-5xl">
          🗺️
        </div>
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
          مخطط رحلات الوادي الجديد
        </h1>
        <p className="max-w-lg text-sm leading-relaxed text-ink-900/60">
          تحدث مع المساعد الذكي أو استخدم المخطط المنظم — كلاهما يبني رحلة حقيقية من بيانات الوادي.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="mt-6 flex gap-2 animate-fade-up">
        <TabButton
          active={tab === "chat"}
          onClick={() => setTab("chat")}
          label="🤖 محادثة ذكية"
          badge="موصى به"
        />
        <TabButton
          active={tab === "wizard"}
          onClick={() => setTab("wizard")}
          label="📋 المخطط المنظم"
        />
      </div>

      {/* Description under tabs */}
      <p className="mt-2 text-center text-xs text-ink-900/40 animate-fade-up">
        {tab === "chat"
          ? "حرية أكبر — تحدث بطريقتك، عدّل، اسأل، واحصل على اقتراحات ذكية"
          : "سريع وواضح — اختر الأيام والاهتمامات والميزانية في خطوات"}
      </p>

      {/* Chat panel */}
      {tab === "chat" && (
        <div className="mt-4 animate-fade-up rounded-3xl border border-sand-200 bg-white shadow-sm overflow-hidden">
          <ChatPanel initialTrip={trip} onTripChange={setTrip} />
        </div>
      )}

      {/* Structured wizard */}
      {tab === "wizard" && (
        <div className="mt-6 animate-fade-up rounded-3xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
          <PlannerWizard categories={categories} />
        </div>
      )}

      {/* Cross-tab hint — show when a trip exists in chat and user switches to wizard */}
      {trip && tab === "wizard" && (
        <div className="mt-4 rounded-2xl border border-oasis-100 bg-oasis-50 px-4 py-3 text-xs text-oasis-700 text-center animate-fade-up">
          💡 يوجد رحلة بُنيت بالمحادثة الذكية —{" "}
          <button
            onClick={() => setTab("chat")}
            className="font-bold underline underline-offset-2"
          >
            عُد إليها
          </button>{" "}
          لتعديلها أو إضافة أماكن.
        </div>
      )}

      <Footer />
    </main>
  );
}

function TabButton({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-full px-5 py-2.5 text-sm font-bold transition ${
        active
          ? "bg-oasis-500 text-white shadow"
          : "bg-sand-100 text-ink-900/60 hover:bg-sand-200"
      }`}
    >
      {label}
      {badge && !active && (
        <span className="absolute -top-1.5 -right-1.5 rounded-full bg-terracotta-500 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}
