import { z } from "zod";
// نسبي لا بالاسم المستعار: هذا الملف تستورده سكربتات تعمل بـ node مباشرة،
// وnode لا يقرأ paths من tsconfig.
import { MAX_EVENT_DAYS_AHEAD } from "./config.ts";

/**
 * تحقّق مشترك بين المتصفح والخادم. رسائل الخطأ مفاتيح في القاموس لا نصوصاً،
 * حتى تبقى كل النصوص في lib/i18n.
 */

/** العراق على ‎UTC+3 طوال السنة (أُلغي التوقيت الصيفي سنة ٢٠١٥). */
const BAGHDAD_OFFSET = "+03:00";

/**
 * يوحّد الرقم العراقي إلى ‎+9647XXXXXXXXX.
 * يقبل: 07701234567، 7701234567، ‎+964 770 123 4567، 00964770...
 */
export function normalizeIraqiPhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-()]/g, "").replace(/^\+/, "").replace(/^00/, "");
  const national = digits.startsWith("964")
    ? digits.slice(3)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;
  return /^7\d{9}$/.test(national) ? `+964${national}` : null;
}

/** يحوّل تاريخاً ووقتاً محليين ببغداد إلى ميلي ثانية UTC. */
export function baghdadToEpoch(date: string, time: string): number {
  return Date.parse(`${date}T${time}:00${BAGHDAD_OFFSET}`);
}

const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
const timeOnly = /^\d{2}:\d{2}$/;

export const eventTypeSchema = z.enum(["wedding", "engagement", "feast", "funeral", "other"], {
  message: "eventTypeInvalid",
});

export const newEventSchema = z
  .object({
    hostName: z.string().trim().min(3, { message: "required" }),
    hostPhone: z
      .string()
      .transform((v) => normalizeIraqiPhone(v))
      .refine((v): v is string => v !== null, { message: "phoneInvalid" }),
    organizationId: z
      .string()
      .trim()
      .transform((v) => (v === "" || v === "none" ? null : v)),
    eventType: eventTypeSchema,
    eventDate: z.string().regex(dateOnly, { message: "required" }),
    servingEndsTime: z.string().regex(timeOnly, { message: "required" }),
    expectedGuests: z.coerce
      .number()
      .int()
      .min(10, { message: "guestsRange" })
      .max(5000, { message: "guestsRange" }),
    cuisineNotes: z
      .string()
      .trim()
      .max(500)
      .transform((v) => (v === "" ? null : v)),
    districtId: z.string().trim().min(1, { message: "districtInvalid" }),
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    // القاعدة ٣ و ١ — الإقرار كله إلزامي، لا جزء منه
    declUnserved: z.literal("on", { message: "declarationRequired" }),
    declAccess: z.literal("on", { message: "declarationRequired" }),
    declNoSale: z.literal("on", { message: "declarationRequired" }),
    declarationSignature: z.string().trim().min(5, { message: "signatureShort" }),
  })
  .superRefine((v, ctx) => {
    const eventStart = baghdadToEpoch(v.eventDate, "00:00");

    if (Number.isNaN(eventStart)) {
      ctx.addIssue({ code: "custom", path: ["eventDate"], message: "required" });
      return;
    }
    if (eventStart < baghdadToEpoch(baghdadToday(), "00:00")) {
      ctx.addIssue({ code: "custom", path: ["eventDate"], message: "dateInPast" });
    }
    if (eventStart > Date.now() + MAX_EVENT_DAYS_AHEAD * 86_400_000) {
      ctx.addIssue({ code: "custom", path: ["eventDate"], message: "dateTooFar" });
    }

    const servingEndsAt = baghdadToEpoch(v.eventDate, v.servingEndsTime);
    if (Number.isNaN(servingEndsAt)) {
      ctx.addIssue({ code: "custom", path: ["servingEndsTime"], message: "servingTimeInvalid" });
    }
  });

export type NewEventInput = z.infer<typeof newEventSchema>;

/** تاريخ اليوم كما هو في بغداد، بصيغة YYYY-MM-DD — مستقل عن ساعة الخادم. */
export function baghdadToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Baghdad",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
