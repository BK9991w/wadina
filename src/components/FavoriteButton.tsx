"use client";

import { useFavorites } from "@/lib/favorites-context";

export function FavoriteButton({ id, className }: { id: number; className?: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(id);
      }}
      aria-label={active ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      className={`grid h-9 w-9 place-items-center rounded-full bg-white/90 text-lg shadow-md backdrop-blur transition active:scale-90 ${className ?? ""}`}
    >
      <span className={active ? "scale-110" : "opacity-70"}>{active ? "❤️" : "🤍"}</span>
    </button>
  );
}
