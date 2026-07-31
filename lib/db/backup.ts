// نسخة احتياطية من قاعدة البيانات.
//   npm run backup            → إلى <مجلد القاعدة>/backups
//   SUFRA_BACKUP_DIR=/mnt/x npm run backup
//
// قاعدة SQLite على حجم واحد بلا نسخة أكبر خطر تجاري من كل ثغرة أمنية في
// المشروع مجتمعة: حادث قرص واحد ينهي المنصّة. هذا السكربت يعالج ذلك.
//
// `DatabaseSync.prototype.backup` آمن مع WAL ويعمل والقاعدة قيد الاستعمال —
// بخلاف نسخ الملف بـ cp، الذي قد يلتقط لحظة غير متّسقة.

import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
// `backup` دالة مستقلة في node:sqlite، لا تابع على DatabaseSync
import { backup, DatabaseSync } from "node:sqlite";

const DB_PATH = process.env.SUFRA_DB_PATH ?? join(process.cwd(), "data", "sufra.db");
const BACKUP_DIR = process.env.SUFRA_BACKUP_DIR ?? join(dirname(DB_PATH), "backups");
const KEEP = Number(process.env.SUFRA_BACKUP_KEEP ?? 14);

if (!existsSync(DB_PATH)) {
  console.error(`لا قاعدة في ${DB_PATH}`);
  process.exit(1);
}

mkdirSync(BACKUP_DIR, { recursive: true });

// الطابع بتوقيت UTC وبترتيب معجمي = ترتيب زمني، فالفرز يكفي للتقادم
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const target = join(BACKUP_DIR, `sufra-${stamp}.db`);

const db = new DatabaseSync(DB_PATH, { readOnly: true });
await backup(db, target);
db.close();

const size = statSync(target).size;
console.log(`✓ ${target} (${(size / 1024 / 1024).toFixed(2)} ميغابايت)`);

// التحقّق من سلامة النسخة — نسخة لا تُفتح ليست نسخة
const check = new DatabaseSync(target, { readOnly: true });
const integrity = (check.prepare("PRAGMA integrity_check").get() as { integrity_check: string })
  .integrity_check;
const events = (check.prepare("SELECT count(*) c FROM events").get() as { c: number }).c;
check.close();

if (integrity !== "ok") {
  console.error(`✗ النسخة تالفة: ${integrity}`);
  process.exit(1);
}
console.log(`  سلامة: ${integrity} · مناسبات: ${events}`);

// تقادم
const old = readdirSync(BACKUP_DIR)
  .filter((f) => f.startsWith("sufra-") && f.endsWith(".db"))
  .sort()
  .slice(0, -KEEP);

for (const f of old) {
  rmSync(join(BACKUP_DIR, f));
  console.log(`  حُذفت نسخة قديمة: ${f}`);
}

// ⚠ الصور المرفوعة ليست في القاعدة بل في <مجلد القاعدة>/uploads.
// النسخة الكاملة تحتاجهما معاً — انظر أمر rsync في README.
