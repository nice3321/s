import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * تجزئة كلمات المرور بـ scrypt المدمج في العقدة.
 *
 * لا bcrypt ولا argon2: كلاهما وحدة أصلية تحتاج مترجماً، وتهدم ما تفخر به صورة
 * الإنتاج — `node:24-slim` بلا أدوات بناء. scrypt مدمج ومقبول لهذا الغرض.
 *
 * الصيغة `scrypt$N$r$p$salt$hash` تحمل معاملاتها، فرفع الكلفة لاحقاً لا يبطل
 * الكلمات القديمة: كل تجزئة تُتحقَّق بمعاملاتها هي.
 */

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

const N = 16_384;
const R = 8;
const P = 1;
const KEY_LEN = 64;
const SALT_LEN = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const key = await scryptAsync(password.normalize("NFKC"), salt, KEY_LEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, n, r, p, saltB64, hashB64] = parts;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");

  let actual: Buffer;
  try {
    actual = await scryptAsync(password.normalize("NFKC"), salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
  } catch {
    return false;
  }

  // timingSafeEqual يرمي عند اختلاف الطول، والطول ليس سرّاً
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * الموظفون ٨ محارف على الأقل. الزبائن يُسمح لهم برمز رقمي من ٦ خانات — لوحة
 * المفاتيح العربية على هاتف رخيص تجعل كلمة المرور عدائية، ورمز مع قفل بعد
 * محاولات متناسب مع «قد يطلب أحدهم كباباً إلى بيتك».
 */
export function passwordProblem(password: string, kind: "staff" | "customer"): string | null {
  if (kind === "staff") return password.length >= 8 ? null : "passwordTooShort";
  return /^\d{6}$/.test(password) || password.length >= 8 ? null : "pinInvalid";
}
