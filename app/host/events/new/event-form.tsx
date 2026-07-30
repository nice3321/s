"use client";

import { useActionState, useMemo, useState } from "react";
import { LocationPicker, type LatLng } from "@/components/location-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { estimatedMeals, forecastSurplusKg } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";
import type { District, EventType, Organization } from "@/lib/types";
import { baghdadToday } from "@/lib/validation";
import { createEventAction, type NewEventState } from "./actions";

const t = getDictionary();

const EVENT_TYPES: EventType[] = ["wedding", "engagement", "feast", "funeral", "other"];

// أرقام لاتينية في كل ما هو بيانات، حتى تبقى الخانات ثابتة العرض مع الخط الأحادي.
const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function EventForm({
  districts,
  organizations,
}: {
  districts: District[];
  organizations: Organization[];
}) {
  const [state, formAction, pending] = useActionState<NewEventState, FormData>(
    createEventAction,
    { status: "idle" },
  );

  const [districtId, setDistrictId] = useState(districts[0]?.id ?? "");
  const [guests, setGuests] = useState("");
  const [pin, setPin] = useState<LatLng>({
    lat: districts[0]?.centerLat ?? 33.4258,
    lng: districts[0]?.centerLng ?? 43.3089,
  });

  const district = districts.find((d) => d.id === districtId);
  const districtOrgs = organizations.filter((o) => o.districtId === districtId);

  // التوقّع الحيّ بثوابت المنطقة — نفس المعادلة التي يعيد الخادم حسابها.
  const forecast = useMemo(() => {
    const n = Number(guests);
    if (!district || !Number.isFinite(n) || n < 10) return null;
    const kg = forecastSurplusKg(n, district.kgPerGuest, district.surplusRate);
    return { kg, meals: estimatedMeals(kg) };
  }, [guests, district]);

  const errors = state.status === "error" ? state.errors : {};
  const err = (k: string): string | undefined => {
    const key = errors[k];
    return key ? (t.error as Record<string, string>)[key] ?? t.error.generic : undefined;
  };

  function onDistrictChange(id: string | null) {
    if (!id) return;
    setDistrictId(id);
    const d = districts.find((x) => x.id === id);
    if (d) setPin({ lat: d.centerLat, lng: d.centerLng });
  }

  if (state.status === "success") {
    return (
      <Card className="border-ink/30">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-ink">
            {t.newEvent.successTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-base leading-relaxed">{t.newEvent.successBody}</p>
          <div className="rounded-lg bg-accent p-4">
            <div className="text-sm text-muted-foreground">{t.newEvent.forecast.kg}</div>
            <div className="tnum font-mono text-3xl font-semibold text-ink">
              {nf.format(state.forecastKg)}{" "}
              <span className="font-sans text-lg">{t.common.kg}</span>
            </div>
          </div>
          <Button
            render={<a href="/host/events/new" />}
            nativeButton={false}
            variant="secondary"
            className="tap w-full"
          >
            {t.newEvent.registerAnother}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* ── عن المناسبة ── */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">{t.newEvent.section.basics}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field label={t.newEvent.field.eventType} error={err("eventType")}>
            <Select name="eventType" defaultValue="wedding">
              <SelectTrigger className="tap w-full">
                <SelectValue>{(v: EventType) => t.eventType[v]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((k) => (
                  <SelectItem key={k} value={k}>
                    {t.eventType[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t.newEvent.field.eventDate} error={err("eventDate")}>
            <Input
              type="date"
              name="eventDate"
              required
              min={baghdadToday()}
              className="tap tnum"
              defaultValue={baghdadToday()}
            />
          </Field>

          <Field
            label={t.newEvent.field.servingEndsAt}
            hint={t.newEvent.hint.servingEndsAt}
            error={err("servingEndsTime")}
          >
            <Input
              type="time"
              name="servingEndsTime"
              required
              className="tap tnum"
              defaultValue="23:00"
            />
          </Field>

          <Field
            label={t.newEvent.field.expectedGuests}
            hint={t.newEvent.hint.expectedGuests}
            error={err("expectedGuests")}
          >
            <Input
              type="number"
              name="expectedGuests"
              inputMode="numeric"
              min={10}
              max={5000}
              required
              className="tap tnum text-lg"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </Field>

          <Forecast forecast={forecast} />
        </CardContent>
      </Card>

      {/* ── المكان ── */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">{t.newEvent.section.place}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field label={t.newEvent.field.district} error={err("districtId")}>
            <Select name="districtId" value={districtId} onValueChange={onDistrictChange}>
              <SelectTrigger className="tap w-full">
                <SelectValue>
                  {(v: string) => districts.find((d) => d.id === v)?.nameAr ?? ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t.newEvent.field.organization}>
            <Select name="organizationId" defaultValue="none">
              <SelectTrigger className="tap w-full">
                <SelectValue>
                  {(v: string) =>
                    v === "none"
                      ? t.newEvent.field.organizationNone
                      : (organizations.find((o) => o.id === v)?.nameAr ?? "")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.newEvent.field.organizationNone}</SelectItem>
                {districtOrgs.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t.newEvent.field.location} error={err("lat") ?? err("lng")}>
            <LocationPicker value={pin} onChange={setPin} />
          </Field>
        </CardContent>
      </Card>

      {/* ── الطعام وصاحب المناسبة ── */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">{t.newEvent.section.food}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field label={t.newEvent.field.cuisineNotes} hint={t.newEvent.hint.cuisineNotes}>
            <Textarea name="cuisineNotes" rows={3} className="text-base" />
          </Field>

          <Separator />

          <Field label={t.newEvent.field.hostName} error={err("hostName")}>
            <Input name="hostName" required className="tap text-base" autoComplete="name" />
          </Field>

          <Field
            label={t.newEvent.field.contactPhone}
            hint={t.newEvent.hint.contactPhone}
            error={err("hostPhone")}
          >
            <Input
              name="hostPhone"
              type="tel"
              required
              dir="ltr"
              inputMode="tel"
              placeholder="+964 770 123 4567"
              className="tap tnum text-base"
              autoComplete="tel"
            />
          </Field>
        </CardContent>
      </Card>

      {/* ── الإقرار ── */}
      <Card className="border-ink/40 bg-accent/40">
        <CardHeader>
          <CardTitle className="font-display text-xl">
            {t.newEvent.section.declaration}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-base font-medium">{t.newEvent.declaration.lead}</p>

          <Declaration name="declUnserved" text={t.newEvent.declaration.unserved} />
          <Declaration name="declAccess" text={t.newEvent.declaration.access} />
          <Declaration name="declNoSale" text={t.newEvent.declaration.noSale} />

          {err("declUnserved") && (
            <p className="text-sm font-medium text-destructive">{err("declUnserved")}</p>
          )}

          <Separator />

          <Field
            label={t.newEvent.declaration.signature}
            hint={t.newEvent.declaration.signatureHint}
            error={err("declarationSignature")}
          >
            <Input
              name="declarationSignature"
              required
              placeholder={t.newEvent.declaration.signaturePlaceholder}
              className="tap font-display text-lg"
            />
          </Field>
        </CardContent>
      </Card>

      {err("generic") && (
        <p className="text-center text-base font-medium text-destructive">{err("generic")}</p>
      )}

      <Button type="submit" disabled={pending} className="tap h-14 w-full text-lg">
        {pending ? t.newEvent.submitting : t.newEvent.submit}
      </Button>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-base">{label}</Label>
      {children}
      {hint && <p className="text-sm leading-relaxed text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

function Declaration({ name, text }: { name: string; text: string }) {
  return (
    <Label className="flex cursor-pointer items-start gap-3 rounded-lg bg-card p-4 leading-relaxed">
      <Checkbox name={name} value="on" required className="mt-1 size-6 shrink-0" />
      <span className="text-base font-normal">{text}</span>
    </Label>
  );
}

function Forecast({ forecast }: { forecast: { kg: number; meals: number } | null }) {
  return (
    <div className="rounded-lg border border-ink/30 bg-accent p-4">
      <div className="font-display text-sm text-ink">{t.newEvent.forecast.title}</div>
      {forecast ? (
        <>
          <div className="mt-3 flex items-end gap-6">
            <div>
              <div className="text-sm text-muted-foreground">{t.newEvent.forecast.kg}</div>
              <div className="tnum font-mono text-3xl font-semibold text-ink">
                {nf.format(forecast.kg)}{" "}
                <span className="font-sans text-base">{t.common.kg}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t.newEvent.forecast.meals}</div>
              <div className="tnum font-mono text-3xl font-semibold text-ink">
                {nf.format(forecast.meals)}{" "}
                <span className="font-sans text-base">{t.common.meals}</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t.newEvent.forecast.note}</p>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{t.newEvent.forecast.empty}</p>
      )}
    </div>
  );
}
