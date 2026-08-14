"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "signin" | "signup";

type Props = {
  onClose: () => void;
  /** Optional redirect message shown above the form */
  reason?: string;
};

export function AuthModal({ onClose, reason }: Props) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setSuccess(
          "تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد الحساب."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      // Translate common Supabase errors
      if (msg.includes("Invalid login credentials"))
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      else if (msg.includes("Email not confirmed"))
        setError("يرجى تأكيد بريدك الإلكتروني أولاً.");
      else if (msg.includes("User already registered"))
        setError("هذا البريد مسجّل بالفعل. جرّب تسجيل الدخول.");
      else if (msg.includes("Password should be at least"))
        setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm animate-fade-up rounded-3xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <span className="text-3xl">🌴</span>
            <h2 className="mt-1 text-lg font-extrabold text-ink-900">
              {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
            </h2>
            {reason && (
              <p className="mt-1 text-xs text-oasis-600 font-semibold">
                {reason}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-900/40 hover:bg-sand-100 hover:text-ink-900"
          >
            ✕
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
            <p className="text-2xl mb-2">✉️</p>
            <p className="text-sm font-bold text-emerald-800">{success}</p>
            <button
              onClick={() => { setSuccess(null); setMode("signin"); }}
              className="mt-3 text-xs text-emerald-700 underline"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="mb-1 block text-xs font-bold text-ink-900/60">
                  الاسم
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك الكامل"
                  className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-oasis-400 focus:ring-2 focus:ring-oasis-100"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-bold text-ink-900/60">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                dir="ltr"
                className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-oasis-400 focus:ring-2 focus:ring-oasis-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-ink-900/60">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                dir="ltr"
                className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-oasis-400 focus:ring-2 focus:ring-oasis-100"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-oasis-500 py-3 text-sm font-extrabold text-white shadow transition hover:bg-oasis-600 disabled:opacity-50"
            >
              {loading
                ? "جارٍ المعالجة..."
                : mode === "signin"
                  ? "تسجيل الدخول"
                  : "إنشاء الحساب"}
            </button>

            <p className="text-center text-xs text-ink-900/50">
              {mode === "signin" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError(null);
                }}
                className="font-bold text-oasis-600 underline"
              >
                {mode === "signin" ? "أنشئ حساباً" : "سجّل الدخول"}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
