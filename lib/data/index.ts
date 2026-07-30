import "server-only";
import { join } from "node:path";
import type { DataProvider } from "./provider";
import { SqliteProvider } from "./sqlite";

export type { DataProvider } from "./provider";

const DB_PATH = process.env.SUFRA_DB_PATH ?? join(process.cwd(), "data", "sufra.db");

// اتصال واحد يُعاد استعماله عبر إعادة تحميل التطوير.
declare global {
  var __sufraProvider: DataProvider | undefined;
}

export function getProvider(): DataProvider {
  globalThis.__sufraProvider ??= new SqliteProvider(DB_PATH);
  return globalThis.__sufraProvider;
}
