import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getProvider } from "@/lib/data";
import type { Role } from "@/lib/types";
import type { Actor } from "./actor";
import { STAFF_SESSION_MS } from "./constants";
import { hashToken, readSessionToken } from "./session";

/**
 * طبقة الوصول للبيانات — نقطة التحقّق الوحيدة.
 *
 * توثيق Next يصف فحص `proxy.ts` بأنه تفاؤلي ولا يصلح دفاعاً وحيداً، فالتحقّق
 * هنا: كل صفحة محميّة وكل إجراء خادم يبدأ بواحدة من هذه الدوال.
 */

/** ملفوفة بـ cache: تُنفَّذ مرّة واحدة لكل تصيير مهما سأل عنها من مكوّن. */
export const getActor = cache(async (): Promise<Actor | null> => {
  const token = await readSessionToken();
  if (!token) return null;

  const sessionId = hashToken(token);
  const provider = getProvider();
  const actor = await provider.getActorBySessionId(sessionId);
  if (!actor) return null;

  // تجديد كسول — التابع نفسه يتجاهل النداء إن لم تمضِ ساعة
  await provider.touchSession(sessionId, STAFF_SESSION_MS);
  return actor;
});

export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) redirect("/login");
  return actor;
}

export async function requireRole(...roles: Role[]): Promise<Actor> {
  const actor = await requireActor();
  if (!roles.includes(actor.role)) redirect("/login?denied=1");
  return actor;
}

/** للإجراءات: ترمي بدل أن تحوّل، فالإجراء يعيد خطأً للنموذج. */
export async function actorOrThrow(...roles: Role[]): Promise<Actor> {
  const actor = await getActor();
  if (!actor) throw new Error("unauthenticated");
  if (roles.length > 0 && !roles.includes(actor.role)) throw new Error("forbidden");
  return actor;
}

/** ملكية المنشأة تأتي من الجلسة، لا من حقل في نموذج يرسله المتصفح. */
export function assertOrgMember(actor: Actor, organizationId: string): void {
  if (actor.role === "admin") return;
  if (!actor.orgIds.includes(organizationId)) throw new Error("forbidden");
}
