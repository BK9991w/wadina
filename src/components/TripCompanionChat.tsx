"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { Trip, ConversationMessage, AIChatRequest, AIChatResponse } from "@/types/ai";
import { tripToContext } from "@/lib/ai/context-utils";

type Props = {
  trip: Trip;
  onTripChange?: (trip: Trip) => void;
};

const QUICK_ACTIONS = [
  "إيه المكان اللي بعد كده؟",
  "اقترح مكان مناسب للأطفال",
  "خلّي اليوم أهدى",
  "زيّد يوم إضافي",
  "أضف مكان علاجي",
];

// Default position — above bottom nav
const DEFAULT_POS = { x: 20, y: 88 };

export function TripCompanionChat({ trip, onTripChange }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTrip, setCurrentTrip] = useState<Trip>(trip);

  // Draggable state — stored as distance from bottom-left
  const [pos, setPos] = useState(DEFAULT_POS);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const isDragging = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ConversationMessage[]>(messages);
  const tripRef = useRef<Trip>(currentTrip);
  const sendingRef = useRef(false);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { tripRef.current = currentTrip; }, [currentTrip]);
  useEffect(() => { setCurrentTrip(trip); }, [trip]);
  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  // Greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `أهلاً! 🌴 أنا مساعد رحلتك الحالية.\n\nرحلتك: ${currentTrip.summary}\n\nتقدر تسألني عن أي مكان في الخطة، أو تطلب تعديل، أو اقتراح — وأنا هساعدك فوراً.`,
        suggestedReplies: QUICK_ACTIONS.slice(0, 3),
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Drag logic: long-press activates drag ──────────────────────────────
  const startLongPress = (clientX: number, clientY: number) => {
    longPressTimer.current = setTimeout(() => {
      isDragging.current = true;
      dragRef.current = {
        startX: clientX,
        startY: clientY,
        startPosX: pos.x,
        startPosY: pos.y,
      };
      if (btnRef.current) btnRef.current.style.transform = "scale(1.15)";
    }, 400);
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!isDragging.current || !dragRef.current) return;
    const dx = clientX - dragRef.current.startX;
    const dy = dragRef.current.startY - clientY; // y is inverted (bottom-based)
    const newX = Math.max(8, Math.min(window.innerWidth - 72, dragRef.current.startPosX + dx));
    const newY = Math.max(8, Math.min(window.innerHeight - 72, dragRef.current.startPosY + dy));
    setPos({ x: newX, y: newY });
  };

  const endDrag = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (btnRef.current) btnRef.current.style.transform = "";
    isDragging.current = false;
    dragRef.current = null;
  };

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => startLongPress(e.clientX, e.clientY);
  const onMouseMove = useCallback((e: MouseEvent) => moveDrag(e.clientX, e.clientY), [pos]);
  const onMouseUp = useCallback(() => endDrag(), []);

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startLongPress(t.clientX, t.clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  };
  const onTouchEnd = () => endDrag();

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // Click: only fires if not dragging
  const handleClick = () => {
    if (isDragging.current) return;
    setOpen((v) => !v);
  };

  // ── Send message ───────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg || sendingRef.current) return;

    const currentMessages = messagesRef.current;
    const latestTrip = tripRef.current;

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setError(null);
    setSending(true);
    sendingRef.current = true;

    try {
      const tripContextMsg: ConversationMessage = {
        role: "assistant",
        content: `[سياق الرحلة الحالية]\n${tripToContext(latestTrip)}\n[نهاية السياق]`,
      };
      const historyWithContext: ConversationMessage[] =
        currentMessages.length <= 1
          ? [tripContextMsg, ...currentMessages]
          : currentMessages;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, conversation: historyWithContext, trip: latestTrip } as AIChatRequest),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AIChatResponse = await res.json();

      if (Array.isArray(data.conversation) && data.conversation.length > 0) {
        setMessages(data.conversation.filter((m) => !m.content.startsWith("[سياق الرحلة الحالية]")));
      } else {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: data.response.text,
          suggestedReplies: data.response.suggestedReplies,
        }]);
      }

      if (data.trip) {
        setCurrentTrip(data.trip);
        onTripChange?.(data.trip);
      }
    } catch {
      setError("حدث خطأ في الاتصال. حاول مرة أخرى.");
    } finally {
      setSending(false);
      sendingRef.current = false;
    }
  }, [onTripChange]);

  const lastMsg = [...messages].reverse().find((m) => m.role === "assistant") as
    | (ConversationMessage & { suggestedReplies?: string[] }) | undefined;

  // Drawer opens above the button
  const drawerBottom = pos.y + 64;
  const drawerLeft = Math.min(pos.x, window.innerWidth - 400 - 8);

  return (
    <>
      {/* ── Floating button ── */}
      <button
        ref={btnRef}
        onClick={handleClick}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        title="مساعد الرحلة — اضغط مطولاً للتحريك"
        aria-label="مساعد الرحلة"
        style={{
          position: "fixed",
          bottom: pos.y,
          left: pos.x,
          zIndex: 50,
          width: 62,
          height: 62,
          borderRadius: "50%",
          background: open
            ? "linear-gradient(135deg, #123F3A, #203E38)"
            : "linear-gradient(135deg, #C98B2E, #E4B85C)",
          border: "none",
          boxShadow: "0 6px 24px rgba(201,139,46,0.5)",
          cursor: isDragging.current ? "grabbing" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.75rem",
          transition: "background 0.25s, box-shadow 0.25s",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "none",
        }}
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* ── Chat drawer ── */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: drawerBottom,
            left: Math.max(8, drawerLeft),
            zIndex: 49,
            width: "min(390px, calc(100vw - 2rem))",
            maxHeight: "65vh",
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 8px 48px rgba(0,0,0,0.2)",
            border: "1.5px solid #E8D2A0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          dir="rtl"
        >
          {/* Header */}
          <div style={{
            padding: "0.9rem 1rem",
            background: "linear-gradient(135deg, #203E38, #123F3A)",
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
          }}>
            <span style={{ fontSize: "1.35rem" }}>🤖</span>
            <div>
              <p style={{ color: "#E4B85C", fontWeight: 800, fontSize: "0.875rem", margin: 0 }}>
                مساعد الرحلة
              </p>
              <p style={{ color: "rgba(228,184,92,0.6)", fontSize: "0.7rem", margin: 0 }}>
                {currentTrip.days.length} {currentTrip.days.length === 1 ? "يوم" : "أيام"} · اسألني بحرية
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ marginRight: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1 }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-start" : "flex-end" }}>
                <div style={{
                  maxWidth: "85%",
                  padding: "0.6rem 0.85rem",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user" ? "#F0E4CB" : "linear-gradient(135deg, #203E38, #123F3A)",
                  color: msg.role === "user" ? "#1A0D00" : "#F5EDD8",
                  fontSize: "0.8rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {sending && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ padding: "0.6rem 0.85rem", borderRadius: "16px 16px 16px 4px", background: "#203E38", display: "flex", gap: 5 }}>
                  {[0, 150, 300].map((d) => (
                    <span key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: "#E4B85C", display: "inline-block", animation: "wbounce 1s infinite", animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {error && <p style={{ fontSize: "0.75rem", color: "#c0392b", textAlign: "center" }}>⚠️ {error}</p>}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies / actions */}
          {!sending && (lastMsg?.suggestedReplies?.length ?? 0) > 0 && (
            <div style={{ padding: "0.4rem 0.75rem", display: "flex", gap: "0.4rem", overflowX: "auto", borderTop: "1px solid #F0E4CB" }}>
              {lastMsg!.suggestedReplies!.map((r, i) => (
                <button key={i} onClick={() => sendMessage(r)} style={{ flexShrink: 0, padding: "0.35rem 0.75rem", borderRadius: 9999, border: "1.5px solid #C98B2E", background: "none", color: "#9A6318", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {r}
                </button>
              ))}
            </div>
          )}

          {!sending && !(lastMsg?.suggestedReplies?.length) && (
            <div style={{ padding: "0.4rem 0.75rem", display: "flex", gap: "0.4rem", overflowX: "auto", borderTop: "1px solid #F0E4CB" }}>
              {QUICK_ACTIONS.map((a, i) => (
                <button key={i} onClick={() => sendMessage(a)} style={{ flexShrink: 0, padding: "0.35rem 0.75rem", borderRadius: 9999, border: "1.5px solid #E8D2A0", background: "#F5EDD8", color: "#9A6318", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {a}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "0.6rem 0.75rem", borderTop: "1px solid #F0E4CB", display: "flex", gap: "0.5rem" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(input); } }}
              placeholder="اسأل عن رحلتك..."
              disabled={sending}
              style={{ flex: 1, padding: "0.55rem 0.85rem", borderRadius: 9999, border: "1.5px solid #E8D2A0", background: "#F5EDD8", fontSize: "0.8rem", outline: "none", color: "#1A0D00" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || sending}
              style={{ width: 38, height: 38, borderRadius: "50%", background: input.trim() && !sending ? "linear-gradient(135deg, #C98B2E, #E4B85C)" : "#E8D2A0", border: "none", cursor: input.trim() && !sending ? "pointer" : "not-allowed", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              ➤
            </button>
          </div>

          <style>{`
            @keyframes wbounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
