"use client";

import { useRouter } from "next/navigation";

export function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button
      onClick={handleBack}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.5rem 1.1rem",
        background: "rgba(240,228,200,0.85)",
        border: "1.5px solid #C98B2E",
        borderRadius: 9999,
        color: "#1A0D00",
        fontWeight: 700,
        fontSize: "0.85rem",
        cursor: "pointer",
        backdropFilter: "blur(4px)",
        transition: "background 0.2s",
      }}
    >
      ← رجوع
    </button>
  );
}
