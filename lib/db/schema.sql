-- سُفرة — سكيما SQLite. القسم ٦ من المواصفة، وقيود القسم ٥ مفروضة هنا لا في التوثيق.
--
-- اصطلاحان ثابتان:
--   • كل الأوقات INTEGER = ميلي ثانية منذ epoch بتوقيت UTC. تُعرض بتوقيت Asia/Baghdad.
--     (اخترنا الرقم لا النص حتى يصير عمود expires_at حسابياً دقيقاً بلا التباس تحليل التواريخ)
--   • كل المبالغ INTEGER = دينار عراقي بلا كسور.
--   • المصفوفات تُخزَّن JSON نصاً — SQLite بلا نوع مصفوفة.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ── المناطق ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS districts (
  id            TEXT PRIMARY KEY,
  name_ar       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  city          TEXT NOT NULL,
  center_lat    REAL NOT NULL,
  center_lng    REAL NOT NULL,
  -- ثابتا نموذج التوقّع، قابلان للضبط لكل منطقة على حدة
  kg_per_guest  REAL NOT NULL DEFAULT 0.45 CHECK (kg_per_guest > 0),
  surplus_rate  REAL NOT NULL DEFAULT 0.18 CHECK (surplus_rate > 0 AND surplus_rate < 1),
  deleted_at    INTEGER
);

-- ── المستخدمون ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL UNIQUE,          -- الهوية الأساسية، بصيغة ‎+9647XXXXXXXXX
  role         TEXT NOT NULL CHECK (role IN
                 ('admin','coordinator','host','merchant','volunteer','referrer','viewer')),
  district_ids TEXT NOT NULL DEFAULT '[]',    -- JSON: نطاق الرؤية
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at   INTEGER NOT NULL,
  deleted_at   INTEGER,
  CHECK (phone GLOB '+9647[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
  CHECK (json_valid(district_ids))
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role) WHERE deleted_at IS NULL;

-- ── المنشآت ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL CHECK (type IN ('venue','restaurant','bakery','catering','charity')),
  name_ar       TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  district_id   TEXT NOT NULL REFERENCES districts(id),
  address_text  TEXT NOT NULL,
  lat           REAL NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng           REAL NOT NULL CHECK (lng BETWEEN -180 AND 180),
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','suspended')),
  food_safety_agreement_signed_at INTEGER,
  created_at    INTEGER NOT NULL,
  deleted_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_orgs_district ON organizations (district_id) WHERE deleted_at IS NULL;

-- ── المناسبات ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id                  TEXT PRIMARY KEY,
  organization_id     TEXT REFERENCES organizations(id),   -- قد تكون مناسبة بيت بلا قاعة
  host_user_id        TEXT NOT NULL REFERENCES users(id),
  event_type          TEXT NOT NULL
                        CHECK (event_type IN ('wedding','engagement','feast','funeral','other')),
  event_date          INTEGER NOT NULL,
  expected_guests     INTEGER NOT NULL CHECK (expected_guests BETWEEN 10 AND 5000),
  cuisine_notes       TEXT,
  serving_ends_at     INTEGER NOT NULL,
  district_id         TEXT NOT NULL REFERENCES districts(id),
  lat                 REAL NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng                 REAL NOT NULL CHECK (lng BETWEEN -180 AND 180),
  forecast_surplus_kg REAL NOT NULL CHECK (forecast_surplus_kg >= 0),
  service_fee_iqd     INTEGER NOT NULL DEFAULT 0 CHECK (service_fee_iqd >= 0),
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN
                        ('draft','confirmed','team_assigned','collected','closed','cancelled')),
  -- القاعدة ٣: الإقرار بأن الطعام لم يصل الموائد، ومَن أقرّ به
  unserved_confirmed      INTEGER NOT NULL DEFAULT 0 CHECK (unserved_confirmed IN (0,1)),
  unserved_confirmed_by   TEXT REFERENCES users(id),
  declaration_signature   TEXT,
  declaration_signed_at   INTEGER,
  created_at          INTEGER NOT NULL,
  deleted_at          INTEGER,
  CHECK (unserved_confirmed = 0 OR unserved_confirmed_by IS NOT NULL),
  CHECK (declaration_signature IS NULL OR length(trim(declaration_signature)) >= 5)
);
CREATE INDEX IF NOT EXISTS idx_events_board
  ON events (district_id, serving_ends_at) WHERE deleted_at IS NULL;

-- ── العروض التجارية (المرحلة ٢، لكن القيد يُفرض من الآن) ────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id                 TEXT PRIMARY KEY,
  organization_id    TEXT NOT NULL REFERENCES organizations(id),
  source_type        TEXT NOT NULL DEFAULT 'commercial'
                       CHECK (source_type IN ('event','commercial')),
  title_ar           TEXT NOT NULL,
  description_ar     TEXT,
  portions           INTEGER NOT NULL CHECK (portions > 0),
  original_price_iqd INTEGER NOT NULL CHECK (original_price_iqd >= 0),
  price_iqd          INTEGER NOT NULL CHECK (price_iqd >= 0),
  available_from     INTEGER NOT NULL,
  available_until    INTEGER NOT NULL,
  pickup_or_delivery TEXT NOT NULL CHECK (pickup_or_delivery IN ('pickup','delivery','both')),
  status             TEXT NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active','sold_out','expired','cancelled')),
  created_at         INTEGER NOT NULL,
  deleted_at         INTEGER,
  CHECK (available_until > available_from),
  CHECK (price_iqd <= original_price_iqd),
  -- القاعدة ١: طعام المناسبات لا يُباع. لا بسعر رمزي ولا بخصم ولا بأي حال.
  CHECK (NOT (source_type = 'event' AND price_iqd > 0))
);

-- ── الفرق ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  district_id     TEXT NOT NULL REFERENCES districts(id),
  member_user_ids TEXT NOT NULL DEFAULT '[]',
  vehicle_type    TEXT NOT NULL CHECK (vehicle_type IN ('car','van','pickup','motorcycle')),
  container_count INTEGER NOT NULL CHECK (container_count >= 0),
  created_at      INTEGER NOT NULL,
  deleted_at      INTEGER,
  CHECK (json_valid(member_user_ids))
);

-- ── الدفعات ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batches (
  id                 TEXT PRIMARY KEY,
  source_type        TEXT NOT NULL CHECK (source_type IN ('event','commercial')),
  event_id           TEXT REFERENCES events(id),
  listing_id         TEXT REFERENCES listings(id),
  weight_kg          REAL NOT NULL CHECK (weight_kg > 0),
  food_categories    TEXT NOT NULL DEFAULT '[]',
  contains_meat      INTEGER NOT NULL DEFAULT 0 CHECK (contains_meat IN (0,1)),
  contains_dairy     INTEGER NOT NULL DEFAULT 0 CHECK (contains_dairy IN (0,1)),
  picked_up_at       INTEGER NOT NULL,
  -- القاعدة ٢: ساعتان، محسوبة في القاعدة لا في التطبيق. لا سبيل لتجاوزها بالكتابة.
  expires_at         INTEGER GENERATED ALWAYS AS (picked_up_at + 7200000) VIRTUAL,
  team_id            TEXT REFERENCES teams(id),
  -- القاعدة ٣: لا استلام بلا تأكيد صريح أن الطعام لم يُقدَّم
  unserved_confirmed INTEGER NOT NULL CHECK (unserved_confirmed = 1),
  unserved_confirmed_by TEXT NOT NULL REFERENCES users(id),
  -- القاعدة ٧: عيّنة محتفظ بها ٢٤ ساعة — إلزامية لتيار المناسبات
  retained_sample_kept INTEGER CHECK (retained_sample_kept IN (0,1)),
  temp_at_pickup_c   REAL NOT NULL,           -- القاعدة ٤: قياس أول إلزامي
  pickup_photo_url   TEXT NOT NULL,           -- القاعدة ٦
  pickup_lat         REAL NOT NULL,
  pickup_lng         REAL NOT NULL,
  picked_up_by       TEXT NOT NULL REFERENCES users(id),
  status             TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN
                       ('assigned','in_transit','delivered','partial','discarded')),
  created_at         INTEGER NOT NULL,
  deleted_at         INTEGER,
  CHECK (json_valid(food_categories)),
  CHECK ((event_id IS NOT NULL) <> (listing_id IS NOT NULL)),
  CHECK (source_type <> 'event'      OR event_id   IS NOT NULL),
  CHECK (source_type <> 'commercial' OR listing_id IS NOT NULL),
  CHECK (NOT (source_type = 'event' AND retained_sample_kept IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_batches_open
  ON batches (status, picked_up_at) WHERE deleted_at IS NULL;

-- ── الجولات ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS runs (
  id           TEXT PRIMARY KEY,
  batch_id     TEXT NOT NULL REFERENCES batches(id),
  volunteer_id TEXT NOT NULL REFERENCES users(id),
  started_at   INTEGER NOT NULL,
  completed_at INTEGER,
  distance_km  REAL CHECK (distance_km IS NULL OR distance_km >= 0),
  deleted_at   INTEGER,
  CHECK (completed_at IS NULL OR completed_at >= started_at)
);

-- ── الأسر المستفيدة ────────────────────────────────────────────────────────
-- القاعدة ٥: رمز الأسرة هو ما يظهر في كل تقرير. الاسم والعنوان لا يخرجان أبداً.
CREATE TABLE IF NOT EXISTS recipients (
  id                    TEXT PRIMARY KEY,
  household_code        TEXT NOT NULL UNIQUE,
  household_name        TEXT,                 -- لا يُصدَّر ولا يظهر في تقرير
  address_text          TEXT,                 -- يراه المتطوع المكلّف يوم التسليم فقط
  size                  INTEGER NOT NULL CHECK (size > 0),
  district_id           TEXT NOT NULL REFERENCES districts(id),
  category              TEXT NOT NULL CHECK (category IN
                          ('family','hospital_companion','day_laborer','student','orphanage','elderly')),
  referrer_user_id      TEXT NOT NULL REFERENCES users(id),
  verified_at           INTEGER,
  contact_phone_encrypted TEXT,
  lat                   REAL,
  lng                   REAL,
  last_served_at        INTEGER,
  served_count          INTEGER NOT NULL DEFAULT 0 CHECK (served_count >= 0),
  created_at            INTEGER NOT NULL,
  deleted_at            INTEGER
);
-- ترتيب التدوير: الأقدم خدمةً أولاً حتى تتوزّع بدل أن تتركّز
CREATE INDEX IF NOT EXISTS idx_recipients_rotation
  ON recipients (district_id, last_served_at) WHERE deleted_at IS NULL;

-- ── التسليمات ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deliveries (
  id                TEXT PRIMARY KEY,
  batch_id          TEXT NOT NULL REFERENCES batches(id),
  recipient_id      TEXT NOT NULL REFERENCES recipients(id),
  portions          INTEGER NOT NULL CHECK (portions > 0),
  delivered_at      INTEGER NOT NULL,
  temp_at_delivery_c REAL NOT NULL,           -- القاعدة ٤: قياس ثانٍ إلزامي
  proof_photo_url   TEXT NOT NULL,            -- القاعدة ٥: صورة الوعاء المغلق، لا شخص
  lat               REAL NOT NULL,
  lng               REAL NOT NULL,
  volunteer_id      TEXT NOT NULL REFERENCES users(id),
  deleted_at        INTEGER
);
CREATE INDEX IF NOT EXISTS idx_deliveries_batch ON deliveries (batch_id);

-- القاعدة ٢: التسليم بعد انتهاء المهلة مرفوض في القاعدة نفسها. لا استثناء لمشرف.
CREATE TRIGGER IF NOT EXISTS trg_delivery_before_expiry
BEFORE INSERT ON deliveries
FOR EACH ROW
WHEN NEW.delivered_at > (SELECT picked_up_at + 7200000 FROM batches WHERE id = NEW.batch_id)
BEGIN
  SELECT RAISE(ABORT, 'batch_expired');
END;

-- ── الحوادث ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
  id               TEXT PRIMARY KEY,
  batch_id         TEXT REFERENCES batches(id),
  type             TEXT NOT NULL CHECK (type IN
                     ('temperature','delay','quality','complaint','illness')),
  severity         TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  description      TEXT NOT NULL,
  reported_by      TEXT NOT NULL REFERENCES users(id),
  resolved_at      INTEGER,
  resolution_notes TEXT,
  created_at       INTEGER NOT NULL,
  deleted_at       INTEGER
);

-- ── سجل التدقيق ────────────────────────────────────────────────────────────
-- القاعدة ٦: إلحاق فقط. لا تعديل ولا حذف، والمحرّكان أدناه يفرضان ذلك.
CREATE TABLE IF NOT EXISTS audit_log (
  id             TEXT PRIMARY KEY,
  actor_user_id  TEXT REFERENCES users(id),
  entity_type    TEXT NOT NULL,
  entity_id      TEXT NOT NULL,
  action         TEXT NOT NULL,
  before_json    TEXT,
  after_json     TEXT,
  created_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log (entity_type, entity_id, created_at);

CREATE TRIGGER IF NOT EXISTS trg_audit_no_update
BEFORE UPDATE ON audit_log
BEGIN
  SELECT RAISE(ABORT, 'audit_log_is_append_only');
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_no_delete
BEFORE DELETE ON audit_log
BEGIN
  SELECT RAISE(ABORT, 'audit_log_is_append_only');
END;
