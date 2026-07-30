// ثوابت التشغيل. ما يختلف بين منطقة وأخرى يعيش في جدول districts، لا هنا.

/** القاعدة ٢ — مهلة الساعتين. مكرّرة في القاعدة كعمود محسوب، وهذه للعرض فقط. */
export const BATCH_TTL_MS = 120 * 60 * 1000;

/**
 * وزن الوجبة الواحدة عند تحويل الكيلوغرامات إلى «عدد وجبات» في شاشة التوقّع.
 * تقدير عرضي فقط — لا يدخل في أي حساب مخزون أو تسليم.
 */
export const KG_PER_MEAL = 0.45;

/** القاعدة ٤ — حدود الحرارة. الخروج عنها يوقف الإجراء ويطلب تجاوز منسّق بسبب مكتوب. */
export const TEMP_HOT_MIN_C = 60;
export const TEMP_COLD_MAX_C = 5;

/** أبعد موعد نستقبل تسجيله. */
export const MAX_EVENT_DAYS_AHEAD = 90;

export const TIMEZONE = "Asia/Baghdad";

/**
 * توقّع الفائض: عدد الضيوف × كغم لكل ضيف × نسبة الفائض.
 * نخزّن الوزن الفعلي عند الاستلام حتى يُضبط النموذج على الواقع لاحقاً.
 */
export function forecastSurplusKg(
  expectedGuests: number,
  kgPerGuest: number,
  surplusRate: number,
): number {
  return Math.round(expectedGuests * kgPerGuest * surplusRate * 10) / 10;
}

export function estimatedMeals(surplusKg: number): number {
  return Math.floor(surplusKg / KG_PER_MEAL);
}
