import { TIMEZONE } from "./config";

// أرقام لاتينية في كل ما هو بيانات — الخانات تبقى ثابتة العرض مع الخط الأحادي.
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const time = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const weekdayDate = new Intl.DateTimeFormat("ar-IQ", {
  timeZone: TIMEZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

const isoDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const fmtNumber = (n: number): string => number.format(n);
export const fmtTime = (ms: number): string => time.format(new Date(ms));
export const fmtWeekdayDate = (ms: number): string => weekdayDate.format(new Date(ms));

/** مفتاح اليوم في بغداد — لتجميع البطاقات في أعمدة الخط الزمني. */
export const baghdadDayKey = (ms: number): string => isoDate.format(new Date(ms));

export type Urgency = "calm" | "soon" | "now" | "passed";

/**
 * إلحاح انتهاء التقديم. الفريق يتحرّك عند انتهاء التقديم لا قبله،
 * فالساعة الأخيرة هي نافذة التجهيز الحقيقية.
 */
export function urgencyOf(msLeft: number): Urgency {
  if (msLeft <= 0) return "passed";
  if (msLeft <= 60 * 60_000) return "now";
  if (msLeft <= 6 * 60 * 60_000) return "soon";
  return "calm";
}

/** «٥ س ٤٠ د» — بلا ثوانٍ، فاللوحة تُقرأ لا تُراقب. */
export function fmtDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 60_000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d} ي ${h % 24} س`;
  }
  return h > 0 ? `${h} س ${m} د` : `${m} د`;
}
