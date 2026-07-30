"use client";

import { useMemo, useState } from "react";
import { estimatedMeals } from "@/lib/config";
import {
  baghdadDayKey,
  fmtDuration,
  fmtNumber,
  fmtTime,
  fmtWeekdayDate,
  urgencyOf,
  type Urgency,
} from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import type { BoardEvent, District, EventStatus } from "@/lib/types";
import { useNow } from "@/lib/use-now";

const t = getDictionary();

const URGENCY_STYLE: Record<Urgency, string> = {
  calm: "border-border bg-card text-ink/70",
  soon: "border-saffron/50 bg-saffron/12 text-ink",
  now: "border-saffron bg-saffron/25 text-ink font-semibold",
  passed: "border-clay/50 bg-clay/10 text-clay font-semibold",
};

// الخط العلوي للبطاقة: هدوء عند الاتّساع، وسَفرون كلما ضاق الوقت.
const URGENCY_RAIL: Record<Urgency, string> = {
  calm: "bg-palm/35",
  soon: "bg-saffron/70",
  now: "bg-saffron",
  passed: "bg-clay",
};

const STATUS_STYLE: Record<EventStatus, string> = {
  draft: "border-border bg-muted text-ink/60",
  confirmed: "border-palm/40 bg-transparent text-palm",
  team_assigned: "border-palm bg-palm text-gypsum",
  collected: "border-border bg-muted text-ink/60",
  closed: "border-border bg-muted text-ink/60",
  cancelled: "border-border bg-muted text-ink/60",
};

export function Board({
  events,
  districts,
  windowStart,
}: {
  events: BoardEvent[];
  districts: District[];
  windowStart: number;
}) {
  const [districtId, setDistrictId] = useState<string | null>(null);

  // ساعة واحدة للوحة كلها بدل مؤقّت في كل بطاقة.
  const nowMs = useNow();

  const shown = useMemo(
    () => (districtId ? events.filter((e) => e.districtId === districtId) : events),
    [events, districtId],
  );

  const totals = useMemo(() => {
    const kg = shown.reduce((s, e) => s + e.forecastSurplusKg, 0);
    return {
      count: shown.length,
      kg: Math.round(kg * 10) / 10,
      meals: estimatedMeals(kg),
      unassigned: shown.filter((e) => e.status !== "team_assigned").length,
    };
  }, [shown]);

  const days = useMemo(() => groupByDay(shown, windowStart), [shown, windowStart]);

  return (
    <div className="space-y-8">
      <section aria-label={t.board.subtitle} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={fmtNumber(totals.count)} label={t.board.stat.events} />
        <Stat value={fmtNumber(totals.kg)} label={t.board.stat.forecastKg} unit={t.common.kg} />
        <Stat value={fmtNumber(totals.meals)} label={t.board.stat.meals} />
        <Stat value={fmtNumber(totals.unassigned)} label={t.board.stat.unassigned} alert />
      </section>

      <section>
        <h2 className="sr-only">{t.board.filterDistrict}</h2>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip active={districtId === null} onClick={() => setDistrictId(null)}>
            {t.board.allDistricts}
          </Chip>
          {districts.map((d) => (
            <Chip
              key={d.id}
              active={districtId === d.id}
              onClick={() => setDistrictId(d.id)}
            >
              {d.nameAr}
            </Chip>
          ))}
        </div>
      </section>

      {days.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
          <span className="block font-display text-lg text-ink/70">{t.board.empty}</span>
          <span className="mt-2 block text-sm text-muted-foreground">{t.board.emptyHint}</span>
        </p>
      ) : (
        <div className="space-y-10">
          {days.map((day) => (
            <section key={day.key} aria-labelledby={`day-${day.key}`}>
              <div className="mb-4 flex items-baseline gap-3 border-b border-border pb-2">
                <h2 id={`day-${day.key}`} className="font-display text-xl text-ink">
                  {day.label}
                </h2>
                <span className="text-sm text-muted-foreground">{day.dateLabel}</span>
                <span className="tnum ms-auto font-mono text-sm text-muted-foreground">
                  {fmtNumber(day.events.length)}
                </span>
              </div>

              <ul className="grid gap-4 lg:grid-cols-2">
                {day.events.map((e) => (
                  <EventCard key={e.id} event={e} nowMs={nowMs} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, nowMs }: { event: BoardEvent; nowMs: number | null }) {
  const msLeft = nowMs === null ? null : event.servingEndsAt - nowMs;
  const urgency: Urgency = msLeft === null ? "calm" : urgencyOf(msLeft);

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-card">
      <div aria-hidden="true" className={`h-1 w-full ${URGENCY_RAIL[urgency]}`} />

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg leading-snug text-ink">
              {t.eventType[event.eventType]}
              <span className="mx-2 text-muted-foreground">·</span>
              <span className="text-base text-ink/70">{event.districtNameAr}</span>
            </h3>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {event.organizationNameAr ?? t.board.card.noVenue} — {event.hostName}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[event.status]}`}
          >
            {t.eventStatus[event.status]}
          </span>
        </div>

        <div className="flex items-end gap-6">
          <div>
            <div className="text-xs text-muted-foreground">{t.board.card.forecast}</div>
            <div className="tnum font-mono text-2xl font-semibold text-palm">
              {fmtNumber(event.forecastSurplusKg)}
              <span className="ms-1 font-sans text-sm font-normal text-ink/60">
                {t.common.kg}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t.board.card.guests}</div>
            <div className="tnum font-mono text-2xl font-semibold text-ink/80">
              {fmtNumber(event.expectedGuests)}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${URGENCY_STYLE[urgency]}`}
        >
          <span className="text-sm">
            {t.board.card.servingEnds}{" "}
            <span className="tnum font-mono font-medium">{fmtTime(event.servingEndsAt)}</span>
          </span>

          {/* بعد التركيب فقط — لا نريد فرقاً بين ما يرسمه الخادم وما يرسمه المتصفح */}
          <span className="tnum font-mono text-sm">
            {msLeft === null
              ? "—"
              : msLeft <= 0
                ? t.board.card.overdue
                : `${t.board.card.timeLeft} ${fmtDuration(msLeft)}`}
          </span>
        </div>
      </div>
    </li>
  );
}

function Stat({
  value,
  label,
  unit,
  alert,
}: {
  value: string;
  label: string;
  unit?: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div
        className={`tnum font-mono text-3xl font-semibold ${
          alert && value !== "0" ? "text-saffron" : "text-palm"
        }`}
      >
        {value}
        {unit && <span className="ms-1 font-sans text-sm font-normal text-ink/60">{unit}</span>}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-palm bg-palm text-gypsum"
          : "border-border bg-card text-ink/75 hover:border-palm/40 hover:text-palm"
      }`}
    >
      {children}
    </button>
  );
}

interface DayGroup {
  key: string;
  label: string;
  dateLabel: string;
  events: BoardEvent[];
}

/** يجمع البطاقات في أعمدة يومية بتوقيت بغداد، ويسمّي الأيام الثلاثة الأولى. */
function groupByDay(events: BoardEvent[], windowStart: number): DayGroup[] {
  const dayNames = [t.board.day.today, t.board.day.tomorrow, t.board.day.dayAfter];
  const keyToLabel = new Map<string, string>();
  for (let i = 0; i < dayNames.length; i++) {
    keyToLabel.set(baghdadDayKey(windowStart + i * 86_400_000), dayNames[i]);
  }

  const groups = new Map<string, DayGroup>();
  for (const e of events) {
    const key = baghdadDayKey(e.servingEndsAt);
    let g = groups.get(key);
    if (!g) {
      const named = keyToLabel.get(key);
      const date = fmtWeekdayDate(e.servingEndsAt);
      // خارج الأيام الثلاثة المسمّاة يصير التاريخ هو العنوان — بلا تكراره بجانبه.
      g = { key, label: named ?? date, dateLabel: named ? date : "", events: [] };
      groups.set(key, g);
    }
    g.events.push(e);
  }

  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
}
