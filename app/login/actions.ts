"use server";

import { redirect } from "next/navigation";
import { LOCK_AFTER_ATTEMPTS, LOCK_MS, STAFF_SESSION_MS } from "@/lib/auth/constants";
import { verifyPassword } from "@/lib/auth/password";
import { newSessionToken, setSessionCookie } from "@/lib/auth/session";
import { getProvider } from "@/lib/data";
import { normalizeIraqiPhone } from "@/lib/validation";

export type LoginState = { status: "idle" } | { status: "error"; error: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const phone = normalizeIraqiPhone(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!phone || password.length === 0) return { status: "error", error: "badCredentials" };

  const provider = getProvider();
  const cred = await provider.findCredentialByPhone(phone);

  // نفس الرسالة لرقم غير موجود ولكلمة خاطئة — وإلا صار النموذج كاشفاً
  // لمن هو مسجّل في المنصّة.
  if (!cred) return { status: "error", error: "badCredentials" };

  if (cred.lockedUntil !== null && cred.lockedUntil > Date.now()) {
    return { status: "error", error: "locked" };
  }

  if (!(await verifyPassword(password, cred.passwordHash))) {
    await provider.recordLoginFailure(cred.userId, LOCK_AFTER_ATTEMPTS, LOCK_MS);
    return { status: "error", error: "badCredentials" };
  }

  await provider.clearLoginFailures(cred.userId);

  const { token, id } = newSessionToken();
  await provider.createSession(id, cred.userId, STAFF_SESSION_MS);
  await setSessionCookie(token, STAFF_SESSION_MS);

  redirect("/coordinator/board");
}
