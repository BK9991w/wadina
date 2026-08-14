"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AIChatRequest, AIChatResponse, ConversationMessage, HotelOption, Trip } from "@/types/ai";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "@/components/AuthModal";
import { ItineraryMap } from "@/components/ItineraryMap";

type Props = {
  initialTrip?: Trip;
  onTripChange?: (trip: Trip | undefined) => void;
};

// Quick-action prompts sent as user messages to trigger real AI tool calls
const TRIP_QUICK_ACTIONS = [
  { label: "✏️ عدّل الرحلة", msg: "عايز أعدّل في الرحلة" },
  { label: "🌅 يوم أهدى", msg: "اجعل أحد أيام الرحلة أكثر هدوءًا" },
  { label: "👧 ناسب للأطفال", msg: "أضف أماكن مناسبة للأطفال" },
  { label: "🔄 غيّر الترتيب", msg: "غيّر ترتيب أيام الرحلة" },
];

const SUGGESTED_STARTERS = [
  "✨ اعمل لي رحلة 4 أيام",
  "🌿 أماكن طبيعية",
  "🏛️ أبرز المعالم الأثرية",
  "♨️ العيون العلاجية",
];

export function ChatPanel({ initialTrip, onTripChange }: Props) {
  const { user } = useAuth();
  const GREETING: ConversationMessage = {
    role: "assistant",
    content: "أهلاً وسهلاً! 👋 أنا وادينا، دليلك الذكي لمحافظة الوادي الجديد.\n\nعشان أبني لك رحلة مناسبة — كم يوم عندك؟ ومع مين رايح؟ وهتنطلق من أي مدينة؟",
  };
  const [messages, setMessages] = useState<ConversationMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trip, setTrip] = useState<Trip | undefined>(() => initialTrip);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));
  const [tripVisible, setTripVisible] = useState(true);
  // Save state
  const [showAuth, setShowAuth] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Map visibility
  const [showMap, setShowMap] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Refs to avoid stale closures
  const messagesRef = useRef<ConversationMessage[]>(messages);
  const tripRef = useRef<Trip | undefined>(trip);
  const sendingRef = useRef(false);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { tripRef.current = trip; }, [trip]);
  // Reset save state when trip changes
  useEffect(() => { setSavedId(null); setSaveError(null); }, [trip]);

  async function handleSaveTrip() {
    if (!trip) return;
    if (!user) { setShowAuth(true); return; }
    setSaving(true);
    setSaveError(null);
    try {
      const title = `رحلة ذكية · ${trip.days?.length ?? 0} أيام`;
      const { data, error: dbErr } = await supabase.from("saved_trips").insert({
        user_id: user.id,
        title,
        summary: trip.summary ?? "",
        input: {},
        result: trip as unknown as Record<string, unknown>,
        selected_hotel: trip.selectedHotel as unknown as Record<string, unknown> ?? null,
      }).select("id").single();
      if (dbErr) throw dbErr;
      setSavedId(data.id);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, trip]);

  const toggleDay = (day: number) =>
    setExpandedDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });

  const sendMessage = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg || sendingRef.current) return;

    const currentMessages = messagesRef.current;
    const currentTrip = tripRef.current;

    const userEntry: ConversationMessage = { role: "user", content: msg };
    setMessages((prev) => [...prev, userEntry]);
    setInput("");
    setError(null);
    setSending(true);
    sendingRef.current = true;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          conversation: currentMessages,
          trip: currentTrip,
        } as AIChatRequest),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: AIChatResponse = await res.json();

      if (Array.isArray(data.conversation) && data.conversation.length > 0) {
        setMessages(data.conversation);
      } else {
        const assistantEntry: ConversationMessage = {
          role: "assistant",
          content: data.response.text,
          trip: data.trip,
          suggestedReplies: data.response.suggestedReplies,
        };
        setMessages((prev) => [...prev, assistantEntry]);
      }

      if (data.trip) {
        setTrip(data.trip);
        setTripVisible(true);
        setExpandedDays(new Set([1]));
        onTripChange?.(data.trip);
      }

      if (data.response.type === "error") setError(data.response.text);
    } catch {
      setError("حدث خطأ في الاتصال. حاول مرة أخرى.");
    } finally {
      setSending(false);
      sendingRef.current = false;
    }
  }, [onTripChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Last assistant message for suggested replies
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const suggestedReplies = lastAssistant?.suggestedReplies ?? [];

  return (
    <div className="flex flex-col gap-0">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} reason="سجّل دخولك لحفظ رحلتك" />}

      {/* ── Messages ── */}
      <div className="min-h-[260px] max-h-[420px] overflow-y-auto px-4 py-4 space-y-3">



        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-fade-up gap-2`}>
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === "user"
                  ? "rounded-br-md bg-oasis-500 text-white"
                  : "rounded-bl-md bg-sand-100 text-ink-900"
              }`}
            >
              {msg.content}
            </div>
            {/* Starter chips — only after greeting (first message, no user messages yet) */}
            {idx === 0 && msg.role === "assistant" && messages.filter((m) => m.role === "user").length === 0 && (
              <div className="flex flex-wrap gap-2 ps-1">
                {SUGGESTED_STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    disabled={sending}
                    className="rounded-full border border-sand-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-900 transition hover:border-oasis-300 hover:bg-oasis-50 disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 animate-fade-up">
            ⚠️ {error}
          </div>
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-sand-100 px-5 py-3.5">
              <div className="flex gap-1.5">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="h-2 w-2 animate-bounce rounded-full bg-oasis-400"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested replies (above input) ── */}
      {suggestedReplies.length > 0 && !sending && messages.length > 0 && (
        <div className="px-4 pb-2 overflow-x-auto">
          <div className="flex gap-2 flex-nowrap">
            {suggestedReplies.map((r, i) => (
              <button
                key={i}
                onClick={() => sendMessage(r)}
                disabled={sending}
                className="shrink-0 rounded-full border border-sand-200 bg-white px-3.5 py-2 text-xs font-bold text-ink-900 transition hover:border-oasis-300 hover:bg-oasis-50 disabled:opacity-40"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Trip quick-actions (when trip exists) ── */}
      {trip && !sending && (
        <div className="border-t border-sand-100 px-4 pt-3 pb-1">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-900/40">تعديل سريع</p>
          <div className="flex gap-2 flex-wrap">
            {TRIP_QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => sendMessage(a.msg)}
                disabled={sending}
                className="rounded-full border border-sand-200 bg-sand-50 px-3 py-1.5 text-xs font-bold text-ink-900 transition hover:border-oasis-400 hover:bg-oasis-50 disabled:opacity-40"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ── */}
      <div className="border-t border-sand-200 bg-white px-4 py-3">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={trip ? "عدّل، اسأل، أضف... مثال: أضف مكان للأطفال" : "أخبرني عن رحلتك... مثال: عايز رحلة 3 أيام مع عائلتي"}
            rows={2}
            disabled={sending}
            className="flex-1 resize-none rounded-xl border border-sand-200 bg-sand-50 p-3 text-sm outline-none transition placeholder:text-ink-900/40 focus:border-oasis-400 focus:bg-white disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="shrink-0 self-end rounded-xl bg-oasis-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-oasis-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ←
          </button>
        </form>
      </div>

      {/* ── Trip result card ── */}
      {trip && trip.days?.length > 0 && (
        <div className="border-t border-sand-200 bg-white">
          {/* Header toggle */}
          <button
            onClick={() => setTripVisible((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-ink-900 transition hover:bg-sand-50"
          >
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-oasis-500 inline-block" />
              رحلتك جاهزة 🎉 ({trip.days.length} أيام)
            </span>
            <span className="text-ink-900/40 text-xs">{tripVisible ? "▲ طيّ" : "▼ عرض"}</span>
          </button>

          {tripVisible && (
            <div className="px-4 pb-5 pt-1 space-y-3 animate-fade-up">

              {/* Summary */}
              <div className="rounded-2xl bg-gradient-to-l from-oasis-600 to-oasis-500 p-4 text-white shadow">
                <p className="text-sm font-bold leading-relaxed">{trip.summary}</p>
                {trip.budgetAdvice && (
                  <p className="mt-1 text-[11px] text-white/80">{trip.budgetAdvice}</p>
                )}
              </div>

              {/* Days — collapsible */}
              {trip.days.map((day) => (
                <div key={day.day} className="rounded-2xl border border-sand-200 bg-white shadow-sm overflow-hidden">
                  {/* Day header — clickable */}
                  <button
                    onClick={() => toggleDay(day.day)}
                    className="flex w-full items-center justify-between p-4 text-left transition hover:bg-sand-50"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-oasis-600">
                        اليوم {day.day}
                      </span>
                      <h4 className="font-extrabold text-ink-900 text-sm mt-0.5">{day.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[10px] font-bold text-ink-900/60">
                        📍 {day.cityNameAr}
                      </span>
                      <span className="text-ink-900/30 text-xs">
                        {expandedDays.has(day.day) ? "▲" : "▼"}
                      </span>
                    </div>
                  </button>

                  {expandedDays.has(day.day) && (
                    <div className="border-t border-sand-100 px-3 pb-3 pt-2 space-y-2">
                      {day.items.map((item, i) => (
                        <Link
                          key={i}
                          href={`/explore/${item.slug}`}
                          className="flex items-center gap-3 rounded-xl border border-sand-100 p-2.5 transition hover:border-oasis-200 hover:bg-oasis-50/40"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                            <Image src={item.imageUrl} alt={item.nameAr} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-bold text-terracotta-600">{item.timeOfDay}</span>
                            <p className="font-bold text-ink-900 text-sm truncate">{item.nameAr}</p>
                            <p className="text-[10px] text-ink-900/50">⭐ {item.rating} · {item.categoryNameAr}</p>
                          </div>
                          {/* Inline delete button — sends natural-language message */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              sendMessage(`احذف "${item.nameAr}" من الرحلة`);
                            }}
                            disabled={sending}
                            className="shrink-0 rounded-full border border-sand-100 p-1.5 text-[10px] text-ink-900/40 transition hover:border-red-200 hover:text-red-500 disabled:opacity-30"
                            title="احذف هذا المكان"
                          >
                            ✕
                          </button>
                        </Link>
                      ))}

                      {day.tip && (
                        <p className="rounded-xl bg-terracotta-500/5 px-3 py-2 text-[11px] font-semibold text-terracotta-600">
                          💡 {day.tip}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Hotels */}
              {trip.hotelOptions && trip.hotelOptions.length > 0 && (
                <HotelPanel
                  hotels={trip.hotelOptions}
                  selectedHotel={trip.selectedHotel}
                  onSelect={(hotel) => sendMessage(`اختار الفندق: ${hotel.nameAr}`)}
                  onSkip={() => sendMessage("تخطى اختيار الفندق، ابنِ الرحلة بدون فندق محدد")}
                />
              )}

              {/* Seasonal advice */}
              {trip.seasonAdvice && (
                <div className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-[11px] text-ink-900/70">
                  🌡️ {trip.seasonAdvice}
                </div>
              )}

              {/* GPS Map */}
              {trip.days?.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowMap((v) => !v)}
                    className="mb-2 flex items-center gap-2 rounded-full border border-oasis-200 bg-oasis-50 px-4 py-2 text-xs font-bold text-oasis-700 hover:bg-oasis-100"
                  >
                    🗺️ {showMap ? "أخفِ الخريطة" : "عرض مسار الرحلة GPS"}
                  </button>
                  {showMap && (
                    <div className="rounded-2xl overflow-hidden border border-sand-200">
                      <ItineraryMap
                        days={trip.days.map((d) => ({
                          day: d.day,
                          title: d.title,
                          cityNameAr: d.cityNameAr,
                          citySlug: d.citySlug ?? d.cityNameAr ?? "",
                          tip: d.tip ?? null,
                          transitionNote: null,
                          items: d.items,
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        })) as any}
                        departureLabel="موقعك الحالي"
                        departureCity={trip.departureCity}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Save button */}
              <div className="rounded-xl border border-sand-200 bg-sand-50 p-3">
                {savedId ? (
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-emerald-700">✅ تم الحفظ!</span>
                    <Link href={`/my-trips/${savedId}`} className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">
                      عرض الرحلة ←
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs text-ink-900/55">احفظ الرحلة لتجدها في «رحلاتي»</p>
                    <button
                      onClick={handleSaveTrip}
                      disabled={saving}
                      className="rounded-full bg-terracotta-500 px-4 py-1.5 text-xs font-extrabold text-white hover:bg-terracotta-600 disabled:opacity-50"
                    >
                      {saving ? "جارٍ الحفظ..." : "💾 احفظ الرحلة"}
                    </button>
                  </div>
                )}
                {saveError && <p className="mt-1 text-[11px] text-red-600">⚠️ {saveError}</p>}
                {!user && !savedId && (
                  <p className="mt-1 text-[11px] text-ink-900/45">
                    <button onClick={() => setShowAuth(true)} className="text-oasis-600 underline font-bold">سجّل دخولك</button> لحفظ الرحلة
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => sendMessage("غيّر عدد أيام الرحلة")}
                  disabled={sending}
                  className="rounded-full border border-sand-200 px-4 py-2 text-xs font-bold text-ink-900 transition hover:bg-sand-100 disabled:opacity-40"
                >
                  📅 غيّر عدد الأيام
                </button>
                <button
                  onClick={() => sendMessage("غيّر الفندق المختار")}
                  disabled={sending}
                  className="rounded-full border border-sand-200 px-4 py-2 text-xs font-bold text-ink-900 transition hover:bg-sand-100 disabled:opacity-40"
                >
                  🏨 غيّر الفندق
                </button>
                <Link
                  href="/explore"
                  className="rounded-full border border-sand-200 px-4 py-2 text-xs font-bold text-ink-900 transition hover:bg-sand-100"
                >
                  🧭 استكشف المزيد
                </Link>
                {trip.suggestedProductSlugs?.length > 0 && (
                  <Link
                    href="/products"
                    className="rounded-full bg-oasis-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-oasis-600"
                  >
                    🧺 منتجات مقترحة
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HotelPanel({
  hotels,
  selectedHotel,
  onSelect,
  onSkip,
}: {
  hotels: HotelOption[];
  selectedHotel?: HotelOption | null;
  onSelect: (hotel: HotelOption) => void;
  onSkip: () => void;
}) {
  const BUDGET_ORDER: Record<string, number> = { premium: 0, medium: 1, economic: 2 };
  const sorted = [...hotels].sort(
    (a, b) => (BUDGET_ORDER[a.budget] ?? 9) - (BUDGET_ORDER[b.budget] ?? 9)
  );
  const shown = sorted.slice(0, 4);

  return (
    <div className="rounded-2xl border border-sand-200 bg-sand-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-900/50">
          🏨 اختر فندق إقامتك
        </p>
        <button
          onClick={onSkip}
          className="text-[11px] font-bold text-ink-900/40 hover:text-ink-900/70 underline"
        >
          تخطى
        </button>
      </div>
      <ul className="space-y-2">
        {shown.map((h) => {
          const isSelected = selectedHotel?.id === h.id;
          return (
            <li
              key={h.id}
              className={`flex items-start gap-3 rounded-xl border p-3 transition cursor-pointer ${
                isSelected
                  ? "border-oasis-400 bg-oasis-50"
                  : "border-sand-100 bg-white hover:border-oasis-200 hover:bg-oasis-50/40"
              }`}
              onClick={() => onSelect(h)}
            >
              <span className="text-xl">{h.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink-900 truncate">{h.nameAr}</p>
                <p className="text-[11px] text-ink-900/50 mt-0.5">
                  {h.stars ? "★".repeat(h.stars) + " · " : "غير مصنّف · "}
                  {h.oasisNameAr}
                </p>
                {h.phone && (
                  <a
                    href={`tel:${h.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 inline-block text-[11px] font-bold text-oasis-600 hover:underline"
                  >
                    📞 {h.phone}
                  </a>
                )}
              </div>
              {isSelected && (
                <span className="shrink-0 text-oasis-500 text-sm font-extrabold">✓</span>
              )}
            </li>
          );
        })}
      </ul>
      {hotels.length > 4 && (
        <p className="mt-2 text-center text-[10px] text-ink-900/40">
          +{hotels.length - 4} فنادق أخرى — قل للمساعد اسم الفندق المفضل
        </p>
      )}
    </div>
  );
}
