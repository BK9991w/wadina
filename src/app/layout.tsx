import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { FavoritesProvider } from "@/lib/favorites-context";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "وادينا | دليلك الذكي لاستكشاف الوادي الجديد",
  description:
    "تطبيق سياحي ذكي يعرّفك على محافظة الوادي الجديد، معالمها الأثرية، السفاري الصحراوي، السياحة العلاجية، ويخطط رحلتك بالذكاء الاصطناعي.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-sand-50 text-ink-900 antialiased">
        <AuthProvider>
          <FavoritesProvider>
            <Header />
            <div className="pb-20 md:pb-0">{children}</div>
            <BottomNav />
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
