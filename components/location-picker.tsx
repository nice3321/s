"use client";

import type { Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDictionary } from "@/lib/i18n";
import "leaflet/dist/leaflet.css";

const t = getDictionary();

export interface LatLng {
  lat: number;
  lng: number;
}

// أيقونة من اللوحة نفسها. تتجنّب أيضاً مسارات صور Leaflet المعطوبة مع الحزم.
const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
  <path d="M16 43C16 43 30 26.5 30 16A14 14 0 1 0 2 16c0 10.5 14 27 14 27z" fill="#242D52" stroke="#F6F4EF" stroke-width="2"/>
  <circle cx="16" cy="16" r="5.5" fill="#EA6A12"/>
</svg>`;

export function LocationPicker({
  value,
  onChange,
  error,
}: {
  value: LatLng;
  onChange: (v: LatLng) => void;
  error?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  // onChange عبر ref: لا نريد إعادة تهيئة الخريطة كلما تغيّرت الدالة.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Leaflet يلمس window عند الاستيراد — لذلك يُحمَّل داخل التأثير لا في أعلى الملف.
    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { attributionControl: true }).setView(
        [value.lat, value.lng],
        16,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const icon = L.divIcon({
        html: PIN_SVG,
        className: "",
        iconSize: [32, 44],
        iconAnchor: [16, 43],
      });
      const marker = L.marker([value.lat, value.lng], { draggable: true, icon, keyboard: true })
        .addTo(map);

      marker.on("dragend", () => {
        const p = marker.getLatLng();
        onChangeRef.current({ lat: p.lat, lng: p.lng });
      });
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      mapRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // مرة واحدة عند التركيب — المزامنة اللاحقة في التأثير أدناه.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تغيّر القيمة من الخارج (تبديل المنطقة، زر الموقع، حقلا الإحداثيات)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const current = markerRef.current.getLatLng();
    if (Math.abs(current.lat - value.lat) < 1e-7 && Math.abs(current.lng - value.lng) < 1e-7) {
      return;
    }
    markerRef.current.setLatLng([value.lat, value.lng]);
    mapRef.current.setView([value.lat, value.lng], mapRef.current.getZoom());
  }, [value.lat, value.lng]);

  function useMyLocation() {
    setLocating(true);
    setDenied(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setDenied(true);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        role="application"
        aria-label={t.map.pick}
        className="h-64 w-full overflow-hidden rounded-lg border border-border bg-muted"
      />

      <Button
        type="button"
        variant="secondary"
        className="tap w-full"
        onClick={useMyLocation}
        disabled={locating}
      >
        {locating ? t.map.locating : t.map.useMyLocation}
      </Button>

      {denied && <p className="text-sm text-destructive">{t.map.denied}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="lat">{t.map.latitude}</Label>
          <Input
            id="lat"
            name="lat"
            inputMode="decimal"
            className="tap tnum font-mono"
            dir="ltr"
            value={value.lat.toFixed(5)}
            onChange={(e) => onChange({ ...value, lat: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lng">{t.map.longitude}</Label>
          <Input
            id="lng"
            name="lng"
            inputMode="decimal"
            className="tap tnum font-mono"
            dir="ltr"
            value={value.lng.toFixed(5)}
            onChange={(e) => onChange({ ...value, lng: Number(e.target.value) })}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{t.map.dragHint}</p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
