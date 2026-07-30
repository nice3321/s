"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDictionary } from "@/lib/i18n";

const t = getDictionary();

export interface LatLng {
  lat: number;
  lng: number;
}

/** إطار صغير حول النقطة لعرض الخريطة. */
function embedUrl({ lat, lng }: LatLng): string {
  const d = 0.004;
  const bbox = [lng - d, lat - d, lng + d, lat + d].map((n) => n.toFixed(5)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

export function LocationPicker({
  value,
  onChange,
  error,
}: {
  value: LatLng;
  onChange: (v: LatLng) => void;
  error?: string;
}) {
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);

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
      <iframe
        key={`${value.lat},${value.lng}`}
        title={t.map.pick}
        src={embedUrl(value)}
        className="h-56 w-full rounded-lg border border-border bg-muted"
        loading="lazy"
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

      <p className="text-sm text-muted-foreground">{t.newEvent.hint.location}</p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
