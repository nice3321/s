// فتح حساب موظف أو تغيير كلمته.
//   npm run set-password -- 07701234567 'كلمة-مرور-قوية'
//
// حسابات الموظفين لا تُفتح ذاتياً: مشرف يفتحها ويبلّغ الكلمة هاتفياً. هذا يطابق
// طريقة استقطابهم فعلاً (وجهاً لوجه أو باتصال)، ويوفّر كلفة رسائل SMS كاملة.
//
// على الخادم: docker exec sufra node lib/db/set-password.ts <رقم> <كلمة>

import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";
import { hashPassword, passwordProblem } from "../auth/password.ts";
import { normalizeIraqiPhone } from "../validation.ts";
import { applySchema } from "./schema.ts";

const [rawPhone, password] = process.argv.slice(2);

if (!rawPhone || !password) {
  console.error("الاستعمال: node lib/db/set-password.ts <رقم الهاتف> <كلمة المرور>");
  process.exit(1);
}

const phone = normalizeIraqiPhone(rawPhone);
if (!phone) {
  console.error(`رقم غير صالح: ${rawPhone} — الصيغة ‎+964 7XX XXX XXXX`);
  process.exit(1);
}

const problem = passwordProblem(password, "staff");
if (problem) {
  console.error("كلمة المرور قصيرة — ٨ محارف على الأقل للموظفين.");
  process.exit(1);
}

const dbPath = process.env.SUFRA_DB_PATH ?? join(process.cwd(), "data", "sufra.db");
const db = new DatabaseSync(dbPath);
applySchema(db);

const user = db
  .prepare("SELECT id, name, role FROM users WHERE phone = ? AND deleted_at IS NULL")
  .get(phone) as { id: string; name: string; role: string } | undefined;

if (!user) {
  console.error(`لا مستخدم بالرقم ${phone}. أنشئه أولاً أو شغّل البذرة.`);
  process.exit(1);
}

const now = Date.now();
db.prepare(
  `INSERT INTO user_credentials (user_id, password_hash, password_set_at, updated_at)
   VALUES (?, ?, ?, ?)
   ON CONFLICT(user_id) DO UPDATE SET
     password_hash = excluded.password_hash,
     failed_attempts = 0, locked_until = NULL, updated_at = excluded.updated_at`,
).run(user.id, await hashPassword(password), now, now);

console.log(`✓ ضُبطت كلمة المرور لـ ${user.name} (${user.role}) — ${phone}`);
