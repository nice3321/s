import "server-only";
import { join } from "node:path";
import type { DataProvider } from "./provider";
import { SqliteProvider } from "./sqlite";

export type { DataProvider } from "./provider";

const DB_PATH = process.env.SUFRA_DB_PATH ?? join(process.cwd(), "data", "sufra.db");

// اتصال واحد يُعاد استعماله عبر إعادة تحميل التطوير.
declare global {
  var __sufraProvider: SqliteProvider | undefined;
}

export function getProvider(): DataProvider {
  // instanceof لا ??= : بعد إعادة التحميل الساخن يصير SqliteProvider صنفاً جديداً،
  // فيسقط الفحص وتُبنى نسخة محدّثة بدل نسخة قديمة تنقصها التوابع الجديدة.
  if (!(globalThis.__sufraProvider instanceof SqliteProvider)) {
    globalThis.__sufraProvider = new SqliteProvider(DB_PATH);
  }
  return globalThis.__sufraProvider;
}
