// اختبار لكل قاعدة من قواعد القسم ٥ — على القاعدة نفسها، لا على التطبيق.
// يُشغَّل: npm run test:rules   (بلا إطار اختبار — assert من المكتبة القياسية)

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { applySchema, readUserVersion } from "./schema.ts";

const db = new DatabaseSync(":memory:");
applySchema(db);

const now = Date.now();
const id = () => randomUUID();

function rejects(fn: () => void, label: string) {
  assert.throws(fn, label);
  console.log(`  ✓ ${label}`);
}
function accepts(fn: () => void, label: string) {
  fn();
  console.log(`  ✓ ${label}`);
}

// ── تجهيز أدنى ما يلزم ───────────────────────────────────────────────────────
db.prepare(
  `INSERT INTO districts (id, name_ar, name_en, city, center_lat, center_lng)
   VALUES ('d1','الرمادي','Ramadi','الرمادي',33.4258,43.3089)`,
).run();

const userId = id();
db.prepare(
  `INSERT INTO users (id,name,phone,role,district_ids,status,created_at)
   VALUES (?,'متطوع','+9647701234567','volunteer','["d1"]','active',?)`,
).run(userId, now);

const orgId = id();
db.prepare(
  `INSERT INTO organizations (id,type,name_ar,contact_phone,district_id,address_text,lat,lng,status,created_at)
   VALUES (?,'venue','قاعة','+9647701234568','d1','عنوان',33.4,43.3,'approved',?)`,
).run(orgId, now);

const eventId = id();
db.prepare(
  `INSERT INTO events (id,host_user_id,event_type,event_date,expected_guests,serving_ends_at,
                       district_id,lat,lng,forecast_surplus_kg,status,unserved_confirmed,
                       unserved_confirmed_by,created_at)
   VALUES (?,?,'wedding',?,300,?,'d1',33.4,43.3,24.3,'confirmed',1,?,?)`,
).run(eventId, userId, now, now, userId, now);

const insertBatch = (over: Partial<Record<string, unknown>> = {}) => {
  const b = {
    id: id(),
    source_type: "event",
    event_id: eventId,
    listing_id: null,
    weight_kg: 22.5,
    picked_up_at: now,
    unserved_confirmed: 1,
    unserved_confirmed_by: userId,
    retained_sample_kept: 1,
    temp_at_pickup_c: 65,
    ...over,
  };
  db.prepare(
    `INSERT INTO batches (id,source_type,event_id,listing_id,weight_kg,picked_up_at,
       unserved_confirmed,unserved_confirmed_by,retained_sample_kept,temp_at_pickup_c,
       pickup_photo_url,pickup_lat,pickup_lng,picked_up_by,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?, 'photo.jpg',33.4,43.3,?,?)`,
  ).run(
    b.id, b.source_type, b.event_id, b.listing_id, b.weight_kg, b.picked_up_at,
    b.unserved_confirmed, b.unserved_confirmed_by, b.retained_sample_kept,
    b.temp_at_pickup_c, userId, now,
  );
  return b.id as string;
};

// ── القاعدة ١: طعام المناسبات لا يُباع ────────────────────────────────────────
console.log("القاعدة ١ — طعام المناسبات لا يُباع");
rejects(
  () =>
    db
      .prepare(
        `INSERT INTO listings (id,organization_id,source_type,title_ar,portions,
           original_price_iqd,price_iqd,available_from,available_until,pickup_or_delivery,created_at)
         VALUES (?,?,'event','قوزي',20,10000,1000,?,?,'pickup',?)`,
      )
      .run(id(), orgId, now, now + 3600000, now),
  "سعر موجب على مصدر مناسبة مرفوض — حتى لو رمزياً",
);
accepts(
  () =>
    db
      .prepare(
        `INSERT INTO listings (id,organization_id,source_type,title_ar,portions,
           original_price_iqd,price_iqd,available_from,available_until,pickup_or_delivery,created_at)
         VALUES (?,?,'commercial','معجنات',20,10000,3000,?,?,'pickup',?)`,
      )
      .run(id(), orgId, now, now + 3600000, now),
  "السعر مسموح على المصدر التجاري",
);

// ── القاعدة ٢: الساعتان ──────────────────────────────────────────────────────
console.log("القاعدة ٢ — مهلة الساعتين");
const batchId = insertBatch();
const expires = (
  db.prepare("SELECT expires_at e FROM batches WHERE id = ?").get(batchId) as { e: number }
).e;
assert.equal(expires, now + 7_200_000);
console.log("  ✓ expires_at محسوب في القاعدة = وقت الاستلام + ١٢٠ دقيقة");

const recipientId = id();
db.prepare(
  `INSERT INTO recipients (id,household_code,size,district_id,category,referrer_user_id,served_count,created_at)
   VALUES (?,'RAM-0001',5,'d1','family',?,0,?)`,
).run(recipientId, userId, now);

const insertDelivery = (deliveredAt: number) =>
  db
    .prepare(
      `INSERT INTO deliveries (id,batch_id,recipient_id,portions,delivered_at,
         temp_at_delivery_c,proof_photo_url,lat,lng,volunteer_id)
       VALUES (?,?,?,6,?,62,'door.jpg',33.4,43.3,?)`,
    )
    .run(id(), batchId, recipientId, deliveredAt, userId);

accepts(() => insertDelivery(now + 60 * 60 * 1000), "تسليم داخل المهلة مقبول");
rejects(
  () => insertDelivery(now + 7_200_001),
  "تسليم بعد المهلة مرفوض — لا تجاوز حتى لمشرف",
);

// ── القاعدة ٣: طعام غير مُقدَّم فقط ───────────────────────────────────────────
console.log("القاعدة ٣ — طعام لم يصل الموائد");
rejects(() => insertBatch({ unserved_confirmed: 0 }), "استلام بلا تأكيد صريح مرفوض");

// ── القاعدة ٤: الحرارة مسجّلة مرتين ──────────────────────────────────────────
console.log("القاعدة ٤ — الحرارة إلزامية طرفَي الرحلة");
rejects(() => insertBatch({ temp_at_pickup_c: null }), "استلام بلا حرارة مرفوض");
rejects(
  () =>
    db
      .prepare(
        `INSERT INTO deliveries (id,batch_id,recipient_id,portions,delivered_at,
           proof_photo_url,lat,lng,volunteer_id)
         VALUES (?,?,?,6,?, 'door.jpg',33.4,43.3,?)`,
      )
      .run(id(), batchId, recipientId, now + 1000, userId),
  "تسليم بلا حرارة مرفوض",
);

// ── القاعدة ٦: سجل تدقيق لا يُعدَّل ولا يُحذف ─────────────────────────────────
console.log("القاعدة ٦ — سجل التدقيق إلحاق فقط");
const auditId = id();
db.prepare(
  `INSERT INTO audit_log (id,actor_user_id,entity_type,entity_id,action,created_at)
   VALUES (?,?,'event',?,'create',?)`,
).run(auditId, userId, eventId, now);
rejects(
  () => db.prepare("UPDATE audit_log SET action = 'tamper' WHERE id = ?").run(auditId),
  "تعديل سجل التدقيق مرفوض",
);
rejects(
  () => db.prepare("DELETE FROM audit_log WHERE id = ?").run(auditId),
  "حذف سجل التدقيق مرفوض",
);

// ── القاعدة ٧: عيّنة محتفظ بها ───────────────────────────────────────────────
console.log("القاعدة ٧ — العيّنة إلزامية لتيار المناسبات");
rejects(
  () => insertBatch({ retained_sample_kept: null }),
  "دفعة مناسبة بلا حقل عيّنة مرفوضة",
);

// ── نظام الهجرات: التعاقبية ──────────────────────────────────────────────────
// التطبيق مرّتين يجب ألا يغيّر شيئاً. لو فشل هذا، فكل إقلاع حاوية يعيد تطبيق
// هجرة مطبَّقة — وهو ما يفسد قاعدة الإنتاج بصمت.
console.log("نظام الهجرات — التعاقبية");

const tablesBefore = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all()
  .map((r) => (r as { name: string }).name)
  .join(",");
const versionBefore = readUserVersion(db);

applySchema(db);

assert.equal(readUserVersion(db), versionBefore, "user_version تغيّر عند إعادة التطبيق");
assert.equal(
  db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all()
    .map((r) => (r as { name: string }).name)
    .join(","),
  tablesBefore,
  "قائمة الجداول تغيّرت عند إعادة التطبيق",
);
console.log(`  ✓ التطبيق مرّتين لا يغيّر شيئاً (user_version = ${versionBefore})`);

console.log("\nكل قواعد القسم ٥ المفروضة في القاعدة اجتازت.");
