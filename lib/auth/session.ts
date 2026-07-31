import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./constants";

/**
 * الجلسات في القاعدة لا في رمز موقّع.
 *
 * السبب الإبطال الفوري: تعليق مندوب أثناء وردية، أو هاتف تاجر مسروق. رمز
 * عديم الحالة لا يُبطَل قبل انتهائه، والقاعدة موجودة في نفس العملية أصلاً.
 *
 * المخزَّن هو `sha256(token)` لا الرمز: تسريب ملف القاعدة لا يعطي جلسة صالحة،
 * والبحث يبقى إصابة مفتاح أساسي واحدة.
 */

export function newSessionToken(): { token: string; id: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, id: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function setSessionCookie(token: string, maxAgeMs: number): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // بادئة __Host- تُلزم Secure و Path=/ وغياب Domain. أثرها أن المصادقة
    // **لن تعمل** قبل HTTPS — وهذا مقصود: يجعل تخطّي TLS مستحيلاً لا منسيّاً.
    secure: true,
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function readSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}
