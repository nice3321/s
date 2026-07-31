import type { Role } from "@/lib/types";

/**
 * الفاعل — من يقوم بالطلب ونطاق ما يراه.
 *
 * هذا النوع هو حجر التخويل كله: يُمرَّر **وسيطاً إلزامياً أول** لكل تابع مُنطَّق
 * في `DataProvider`، فينشتق الترشيح منه بدل أن يرسله المُستدعي.
 *
 * سبب هذا التشدّد خطأ كان قائماً فعلاً: `listBoardEvents` كان يعامل غياب
 * `districtIds` كـ«كل المناطق»، فكان كل موضع استدعاء على بعد وسيط منسيّ من
 * تسريب كامل — وTypeScript صامت لأن الوسيط اختياري. بجعله إلزامياً يصير
 * النسيان خطأ ترجمة لا حادثة إنتاج.
 */
export interface Actor {
  userId: string;
  role: Role;
  /** مناطق هذا الفاعل. فارغة لمن ليس مُنطَّقاً بمنطقة. */
  districtIds: string[];
  /** المنشآت التي هو عضو فيها — مصدر الحقيقة لملكية الرفع والكتالوج. */
  orgIds: string[];
}

/** المشرف وحده يرى كل المناطق. */
export function seesAllDistricts(actor: Actor): boolean {
  return actor.role === "admin";
}

/**
 * المناطق التي يجوز لهذا الفاعل قراءتها، أو `null` لغير المحدود.
 * المزوّد يستعملها لبناء `IN (?,?)` — ولا يقبل نطاقاً من المُستدعي إطلاقاً.
 */
export function districtScope(actor: Actor): string[] | null {
  return seesAllDistricts(actor) ? null : actor.districtIds;
}

/** من يجوز له رؤية رقم هاتف صاحب مناسبة: من سيتصل به فعلاً. */
export function maySeeHostPhone(actor: Actor, eventDistrictId: string): boolean {
  if (actor.role === "admin") return true;
  if (actor.role === "coordinator") return actor.districtIds.includes(eventDistrictId);
  return false;
}
