-- ٠٠١ — بيانات الاعتماد والجلسات.
--
-- الاعتماد في جدول منفصل عن `users` عمداً، لا التفافاً على قيد ALTER:
-- `lib/data/sqlite.ts` يستعمل `SELECT *` في كل مكان، وعمود تجزئة داخل `users`
-- كان سيتسرّب مع أول استعلام. الفصل يجعل التسريب مستحيلاً بنيوياً لا بالانتباه.

CREATE TABLE IF NOT EXISTS user_credentials (
  user_id         TEXT PRIMARY KEY REFERENCES users(id),
  -- scrypt$N$r$p$salt_b64$hash_b64 — المعاملات داخل النص، فرفعها لاحقاً
  -- لا يحتاج راية ولا هجرة: الصيغة القديمة تبقى قابلة للتحقّق.
  password_hash   TEXT NOT NULL CHECK (password_hash LIKE 'scrypt$%'),
  failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
  -- القفل هنا لا في الذاكرة، فينجو من إعادة تشغيل الحاوية
  locked_until    INTEGER,
  password_set_at INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  -- المفتاح هو sha256(token) لا الرمز نفسه: تسريب ملف القاعدة لا يعطي جلسة
  -- صالحة، والبحث يبقى إصابة مفتاح أساسي واحدة.
  id           TEXT PRIMARY KEY CHECK (length(id) = 64 AND id GLOB '[0-9a-f]*'),
  user_id      TEXT NOT NULL REFERENCES users(id),
  created_at   INTEGER NOT NULL,
  expires_at   INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  revoked_at   INTEGER,
  CHECK (expires_at > created_at)
);

-- إبطال كل جلسات مستخدم دفعةً واحدة — تعليق مندوب أثناء وردية
CREATE INDEX IF NOT EXISTS idx_sessions_user
  ON sessions (user_id) WHERE revoked_at IS NULL;

-- كنس الجلسات المنتهية
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions (expires_at);
