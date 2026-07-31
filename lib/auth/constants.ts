/**
 * ثوابت الجلسة. منفصلة عن `session.ts` لأن ذاك `server-only` ويستورد
 * `next/headers` — والمزوّد يحتاج التوقيت بلا أن يجرّ معه سياق الطلب.
 */

export const SESSION_COOKIE = "__Host-sufra_session";

/** الموظفون ١٢ ساعة — المندوبون يستعملون هواتف مشتركة أو مستعارة. */
export const STAFF_SESSION_MS = 12 * 60 * 60 * 1000;
export const CUSTOMER_SESSION_MS = 30 * 24 * 60 * 60 * 1000;

/** التجديد مرّة كل ساعة على الأكثر — وإلا صار كل عرض صفحة كتابةً في SQLite. */
export const SESSION_TOUCH_MS = 60 * 60 * 1000;

/** القفل بعد خمس محاولات، ربع ساعة. الحالة في القاعدة فتنجو من إعادة التشغيل. */
export const LOCK_AFTER_ATTEMPTS = 5;
export const LOCK_MS = 15 * 60 * 1000;
