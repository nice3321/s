import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";

/**
 * تطبيق السكيما والهجرات.
 *
 * `schema.sql` **مُجمَّد**: هو أساس القواعد الجديدة فقط ولا يُعدَّل بعد اليوم.
 * سبب التجميد أن `CREATE TABLE IF NOT EXISTS` لا يفعل شيئاً على قاعدة قائمة —
 * فإضافة عمود أو توسيع CHECK في ذلك الملف تعمل محلياً وتُهمَل في الإنتاج بصمت.
 *
 * كل تغيير بعده ملف مرقَّم في `migrations/`، يُطبَّق مرّة واحدة في معاملة،
 * ويُسجَّل في `PRAGMA user_version` — وهو عدّاد يشحنه SQLite لهذا الغرض بالضبط،
 * فلا جدول تتبّع ولا تبعية.
 *
 * القاعدتان اللتان تجعلان هذا يعمل:
 *   • الهجرة المطبَّقة لا تُعدَّل أبداً. إن كانت خاطئة فاكتب التالية.
 *   • تُطبَّق من الصفر على القاعدة الجديدة وعلى الحيّة معاً، فتلتقيان على شكل
 *     واحد. هذا الالتقاء هو كل الفائدة — بدونه «يعمل عندي» لا يعني شيئاً.
 */

const MIGRATION_NAME = /^(\d{3})_[a-z0-9_]+\.sql$/;

export function applySchema(db: DatabaseSync): void {
  const dbDir = join(process.cwd(), "lib", "db");

  db.exec(readFileSync(join(dbDir, "schema.sql"), "utf8"));

  let files: string[];
  try {
    files = readdirSync(join(dbDir, "migrations")).filter((f) => f.endsWith(".sql")).sort();
  } catch {
    return; // لا مجلد هجرات بعد
  }

  const current = readUserVersion(db);

  for (const file of files) {
    const match = MIGRATION_NAME.exec(file);
    // التحقّق ليس تجميلاً: PRAGMA user_version لا يقبل معاملاً، فالرقم يُستوفى
    // نصّياً في الأمر. هذا الفحص هو ما يمنع اسم ملف من أن يصير حقن SQL.
    if (!match) throw new Error(`اسم هجرة غير صالح: ${file} (المتوقع NNN_name.sql)`);

    const version = Number(match[1]);
    if (version <= current) continue;

    db.exec("BEGIN");
    try {
      db.exec(readFileSync(join(dbDir, "migrations", file), "utf8"));
      db.exec(`PRAGMA user_version = ${version}`);
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw new Error(`فشلت الهجرة ${file}: ${err instanceof Error ? err.message : err}`);
    }

    console.log(`✓ هجرة ${file}`);
  }
}

export function readUserVersion(db: DatabaseSync): number {
  const row = db.prepare("PRAGMA user_version").get() as { user_version: number };
  return Number(row.user_version);
}
