"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/AuthModal";

const NAV_LINKS = [
  { href: "/", label: "الرئيسية", active: true },
  { href: "/explore", label: "استكشف" },
  { href: "/planner", label: "خطط رحلتك" },
  { href: "/products", label: "منتجات محلية" },
  { href: "/favorites", label: "المفضلة" },
  { href: "/about", label: "عن المشروع" },
];

export function Header() {
  const { user, signOut, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#F0E4CB",
        borderBottom: "2px solid #C98B2E",
        boxShadow: "0 2px 12px rgba(50,28,0,0.10)",
      }}>
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.65rem 1.5rem",
          direction: "rtl",
        }}>
          {/* Logo */}
          <Link href="/" style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}>
            <span style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #C98B2E, #E4B85C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              boxShadow: "0 2px 8px rgba(201,139,46,0.35)",
              flexShrink: 0,
            }}>🌴</span>
            <span style={{
              fontSize: "1.3rem",
              fontWeight: 900,
              color: "#123F3A",
              letterSpacing: "0.02em",
            }}>وادينا</span>
          </Link>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "0.45rem 0.9rem",
                  fontSize: "0.875rem",
                  fontWeight: link.active ? 800 : 600,
                  color: link.active ? "#C98B2E" : "#203E38",
                  textDecoration: "none",
                  borderRadius: 8,
                  borderBottom: link.active ? "2px solid #C98B2E" : "2px solid transparent",
                  transition: "color 0.2s",
                }}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/my-trips"
                style={{
                  padding: "0.45rem 0.9rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#203E38",
                  textDecoration: "none",
                  borderRadius: 8,
                  borderBottom: "2px solid transparent",
                }}
              >
                رحلاتي
              </Link>
            )}
          </nav>

          {/* Auth area */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {loading ? (
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #E4B85C", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
            ) : user ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.45rem 1rem",
                    background: "linear-gradient(135deg, #203E38, #123F3A)",
                    color: "#E4B85C",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    borderRadius: 9999,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span>🌴</span>
                  <span>{user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0]}</span>
                  <span style={{ fontSize: "0.6rem" }}>▾</span>
                </button>
                {showUserMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "110%",
                      left: 0,
                      background: "#fff",
                      border: "1px solid #E8D2A0",
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      minWidth: 160,
                      zIndex: 100,
                      overflow: "hidden",
                    }}
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <Link
                      href="/my-trips"
                      onClick={() => setShowUserMenu(false)}
                      style={{ display: "block", padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 700, color: "#1A0D00", textDecoration: "none", borderBottom: "1px solid #F0E4CB" }}
                    >
                      ✈️ رحلاتي المحفوظة
                    </Link>
                    <button
                      onClick={() => { signOut(); setShowUserMenu(false); }}
                      style={{ display: "block", width: "100%", textAlign: "right", padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 700, color: "#C0392B", background: "none", border: "none", cursor: "pointer" }}
                    >
                      🚪 تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowAuth(true)}
                  style={{
                    padding: "0.5rem 1.1rem",
                    background: "none",
                    border: "1.5px solid #C98B2E",
                    color: "#C98B2E",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    borderRadius: 9999,
                    cursor: "pointer",
                  }}
                >
                  دخول
                </button>
                <Link
                  href="/planner"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.6rem 1.3rem",
                    background: "linear-gradient(135deg, #203E38, #123F3A)",
                    color: "#E4B85C",
                    fontWeight: 800,
                    fontSize: "0.875rem",
                    borderRadius: 9999,
                    textDecoration: "none",
                    boxShadow: "0 2px 10px rgba(18,63,58,0.3)",
                    border: "1px solid rgba(228,184,92,0.3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  ✨ خطط رحلتك الآن
                </Link>
              </>
            )}
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </header>
    </>
  );
}
