"use client";

import { useEffect, useRef, useState } from "react";
import type { PlannerDay } from "@/lib/planner";

interface Props {
  days: PlannerDay[];
  departureLabel?: string;
  departureCity?: string;
}

const DAY_COLORS = ["#1565C0", "#2E7D32", "#AD1457", "#E65100", "#4527A0", "#00838F"];

// Departure city GPS (real coordinates)
// Keys are normalised: lowercase, no spaces, no dashes
const DEPARTURE_GPS_RAW: Record<string, { lat: number; lng: number }> = {
  cairo:      { lat: 30.0444, lng: 31.2357 },
  giza:       { lat: 29.9870, lng: 31.2118 },
  assiut:     { lat: 27.1809, lng: 31.1837 },
  asyut:      { lat: 27.1809, lng: 31.1837 },
  sohag:      { lat: 26.5569, lng: 31.6948 },
  qena:       { lat: 26.1651, lng: 32.7160 },
  luxor:      { lat: 25.6872, lng: 32.6396 },
  aswan:      { lat: 24.0889, lng: 32.8998 },
  minya:      { lat: 28.0871, lng: 30.7618 },
  benisuef:   { lat: 29.0661, lng: 31.0994 },
  // Arabic name aliases (when value comes as Arabic)
  القاهرة:   { lat: 30.0444, lng: 31.2357 },
  الجيزة:    { lat: 29.9870, lng: 31.2118 },
  أسيوط:     { lat: 27.1809, lng: 31.1837 },
  سوهاج:     { lat: 26.5569, lng: 31.6948 },
  قنا:       { lat: 26.1651, lng: 32.7160 },
  الأقصر:    { lat: 25.6872, lng: 32.6396 },
  أسوان:     { lat: 24.0889, lng: 32.8998 },
  المنيا:    { lat: 28.0871, lng: 30.7618 },
  بنيسويف:   { lat: 29.0661, lng: 31.0994 },
};

/** Normalise a city value before lookup: lowercase + strip spaces/dashes */
function normaliseCityKey(val: string): string {
  return val.toLowerCase().replace(/[-\s]/g, "");
}

function resolveDepartureGps(city?: string): { lat: number; lng: number } | null {
  if (!city) return null;
  const key = normaliseCityKey(city);
  // Direct normalised lookup
  const direct = DEPARTURE_GPS_RAW[key];
  if (direct) return direct;
  // Fallback: scan all keys after normalising them too
  for (const [k, v] of Object.entries(DEPARTURE_GPS_RAW)) {
    if (normaliseCityKey(k) === key) return v;
  }
  // Last resort: default to Cairo (centre of Egypt) so map never breaks
  return { lat: 30.0444, lng: 31.2357 };
}

// City arrival / hotel GPS
const CITY_ENTRY_GPS: Record<string, { lat: number; lng: number }> = {
  "الخارجة":  { lat: 25.4456, lng: 30.5568 },
  "الداخلة":  { lat: 25.4895, lng: 28.9700 },
  "الفرافرة": { lat: 27.0598, lng: 27.9698 },
};

type LType = {
  map: (el: HTMLElement, opts: object) => LMap;
  tileLayer: (url: string, opts: object) => { addTo: (m: LMap) => void };
  divIcon: (opts: object) => unknown;
  marker: (latlng: [number, number], opts: object) => LMarker;
  polyline: (latlngs: [number, number][], opts: object) => LPolyline;
  latLngBounds: (points: [number, number][]) => LBounds;
};
type LMap = {
  remove: () => void;
  fitBounds: (b: unknown, opts: object) => void;
  setView: (center: [number, number], zoom: number) => void;
  addLayer: (l: unknown) => void;
  removeLayer: (l: unknown) => void;
};
type LMarker = { addTo: (m: LMap) => LMarker; bindPopup: (s: string) => LMarker; remove: () => void };
type LPolyline = { addTo: (m: LMap) => LPolyline; remove: () => void };
type LBounds = { pad: (n: number) => unknown };

// Step = "arrival" | day number (1,2,3...)
type Step = "arrival" | number;

export function ItineraryMap({ days, departureLabel, departureCity }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const layersRef = useRef<(LMarker | LPolyline)[]>([]);
  const leafletRef = useRef<LType | null>(null);

  const [activeStep, setActiveStep] = useState<Step>("arrival");
  const [mapReady, setMapReady] = useState(false);

  const hasPins = days.some((d) => d.items.some((i) => i.gps !== null));
  const departGps = resolveDepartureGps(departureCity);

  /** Resolve hotel GPS for a given city name — returns null if city not found */
  function getHotelGps(cityNameAr: string): { lat: number; lng: number } | null {
    return CITY_ENTRY_GPS[cityNameAr] ?? null;
  }

  const firstCity = days[0]?.cityNameAr ?? "";

  // Load Leaflet once
  useEffect(() => {
    if (!containerRef.current) return;

    function loadLeaflet(cb: () => void) {
      const win = window as unknown as Record<string, unknown>;
      if (win.L) { cb(); return; }
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = cb;
      document.head.appendChild(script);
    }

    loadLeaflet(() => {
      const L = (window as unknown as Record<string, unknown>).L as LType;
      leafletRef.current = L;
      if (!containerRef.current) return;

      if (mapRef.current) { mapRef.current.remove(); }

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        attributionControl: true,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Initial view: fit Egypt roughly
      map.setView([27.0, 30.0], 5);
      setMapReady(true);
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw layers when step changes
  useEffect(() => {
    if (!mapReady || !mapRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    const map = mapRef.current;

    // Remove previous layers
    layersRef.current.forEach((l) => l.remove());
    layersRef.current = [];

    const addLayer = (l: LMarker | LPolyline) => {
      layersRef.current.push(l);
      return l;
    };

    function makeIcon(html: string, size = 32) {
      return L.divIcon({ className: "", html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
    }

    function addMarker(lat: number, lng: number, iconHtml: string, popup: string, size = 32) {
      const m = L.marker([lat, lng], { icon: makeIcon(iconHtml, size) });
      m.addTo(map).bindPopup(popup);
      addLayer(m);
      return m;
    }

    function addLine(points: [number, number][], color: string, dash = "8,5") {
      const pl = L.polyline(points, { color, weight: 3, opacity: 0.8, dashArray: dash });
      pl.addTo(map);
      addLayer(pl);
    }

    const fitPoints = (pts: [number, number][]) => {
      if (pts.length === 0) return;
      if (pts.length === 1) { map.setView(pts[0], 10); return; }
      const bounds = L.latLngBounds(pts);
      map.fitBounds(bounds.pad(0.3), { maxZoom: 11 });
    };

    // ── ARRIVAL STEP ────────────────────────────────────────────
    if (activeStep === "arrival") {
      const pts: [number, number][] = [];
      const hotelGps = getHotelGps(firstCity);

      // Departure city pin
      if (departGps) {
        addMarker(
          departGps.lat, departGps.lng,
          `<div style="background:#374151;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)">🏠</div>`,
          `<div dir="rtl" style="font-weight:bold;font-size:13px">نقطة الانطلاق: ${departureLabel ?? ""}</div>`,
          36
        );
        pts.push([departGps.lat, departGps.lng]);
      }

      // Hotel / arrival pin (first city = first destination)
      if (hotelGps) {
        addMarker(
          hotelGps.lat, hotelGps.lng,
          `<div style="background:#7C3AED;color:#fff;border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)">🏨</div>`,
          `<div dir="rtl" style="font-weight:bold;font-size:13px">الفندق / الإقامة — ${firstCity}</div><div style="font-size:11px;color:#555">نقطة انطلاق جميع الأيام</div>`,
          36
        );
        pts.push([hotelGps.lat, hotelGps.lng]);
      }

      // Line: departure → hotel
      if (departGps && hotelGps) {
        addLine([[departGps.lat, departGps.lng], [hotelGps.lat, hotelGps.lng]], "#6B7280", "10,6");
      }

      fitPoints(pts.length > 0 ? pts : [[27.0, 30.0]]);
    }

    // ── DAY STEP ─────────────────────────────────────────────────
    if (typeof activeStep === "number") {
      const day = days.find((d) => d.day === activeStep);
      if (!day) return;

      const color = DAY_COLORS[(day.day - 1) % DAY_COLORS.length];
      const pts: [number, number][] = [];
      // Hotel GPS = city of THIS day (not always day 1)
      const dayHotelGps = getHotelGps(day.cityNameAr);

      // Hotel as start of day
      if (dayHotelGps) {
        addMarker(
          dayHotelGps.lat, dayHotelGps.lng,
          `<div style="background:#7C3AED;color:#fff;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:15px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)">🏨</div>`,
          `<div dir="rtl" style="font-weight:bold;font-size:13px">الفندق — ${day.cityNameAr} (اليوم ${day.day})</div>`,
          32
        );
        pts.push([dayHotelGps.lat, dayHotelGps.lng]);
      }

      // Day attractions
      let idx = 0;
      day.items.forEach((item) => {
        if (!item.gps) return;
        idx++;
        const timeLabel = item.timeOfDay;
        addMarker(
          item.gps.lat, item.gps.lng,
          `<div style="background:${color};color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)">${idx}</div>`,
          `<div dir="rtl" style="font-weight:bold;font-size:13px">${item.attraction.nameAr}</div><div style="font-size:11px;color:#555">${timeLabel} — اليوم ${day.day}</div>`,
          32
        );
        pts.push([item.gps.lat, item.gps.lng]);
      });

      // Line connecting hotel → attractions in order
      if (pts.length >= 2) {
        addLine(pts, color, "6,4");
      }

      fitPoints(pts);
    }
  }, [activeStep, mapReady, days, departGps, departureLabel, firstCity]);

  if (!hasPins) return null;

  const daysWithGps = days.filter((d) => d.items.some((i) => i.gps !== null));

  return (
    <div className="rounded-2xl border border-sand-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h3 className="font-extrabold text-ink-900 text-base mb-1">🗺️ خريطة مسار رحلتك</h3>
        <p className="text-xs text-ink-900/50">اختر مرحلة لعرض تفاصيل المسار</p>
      </div>

      {/* Step selector */}
      <div className="px-5 pb-3 flex gap-2 flex-wrap">
        {/* Arrival button */}
        <button
          onClick={() => setActiveStep("arrival")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-all ${
            activeStep === "arrival"
              ? "bg-gray-700 text-white border-gray-700 shadow"
              : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
          }`}
        >
          🏠 الوصول والفندق
        </button>

        {/* Day buttons */}
        {daysWithGps.map((day) => {
          const color = DAY_COLORS[(day.day - 1) % DAY_COLORS.length];
          const isActive = activeStep === day.day;
          return (
            <button
              key={day.day}
              onClick={() => setActiveStep(day.day)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-all ${
                isActive ? "text-white shadow" : "bg-white hover:opacity-80"
              }`}
              style={
                isActive
                  ? { background: color, borderColor: color }
                  : { color, borderColor: color }
              }
            >
              اليوم {day.day}: {day.cityNameAr}
            </button>
          );
        })}
      </div>

      {/* Map */}
      <div
        ref={containerRef}
        style={{ height: 360, width: "100%" }}
      />

      {/* Step info bar */}
      <div className="px-5 py-3 border-t border-sand-100 bg-sand-50">
        {activeStep === "arrival" && (
          <div className="flex items-center gap-3 text-xs text-ink-900/70 flex-wrap">
            <span>🏠 <strong>{departureLabel}</strong> ← نقطة الانطلاق</span>
            <span className="text-sand-300">|</span>
            <span>🏨 الفندق في <strong>{firstCity}</strong></span>
            <span className="text-sand-300">|</span>
            <span className="text-gray-400">— — الخط المتقطع = مسار التنقل</span>
          </div>
        )}
        {typeof activeStep === "number" && (() => {
          const day = days.find((d) => d.day === activeStep);
          if (!day) return null;
          const color = DAY_COLORS[(day.day - 1) % DAY_COLORS.length];
          const pinsCount = day.items.filter((i) => i.gps !== null).length;
          return (
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span
                className="font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: color }}
              >
                اليوم {day.day}
              </span>
              <span className="text-ink-900/70">{day.title}</span>
              <span className="text-sand-300">|</span>
              <span className="text-ink-900/50">{pinsCount} أماكن على الخريطة</span>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
