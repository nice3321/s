// بذر بيانات تجريبية واقعية للأنبار. يُشغَّل: npm run seed
//
// يبدأ من ملف قاعدة نظيف. لا يمكن «تنظيف» الجداول بـ DELETE لأن audit_log
// إلحاق فقط بالتصميم (القاعدة ٦) ويشير إلى users — وهذا مقصود، لا عيب.

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { applySchema } from "./schema.ts";

const DB_PATH = process.env.SUFRA_DB_PATH ?? join(process.cwd(), "data", "sufra.db");
const now = Date.now();

// حارس: البذر يمسح كل شيء. لا يعمل على إنتاج إلا بإقرار صريح.
if (process.env.NODE_ENV === "production" && process.env.SUFRA_SEED_FORCE !== "1") {
  console.error(
    "رفض: البذر يمسح قاعدة البيانات كاملة، والبيئة إنتاج.\n" +
      "لو كان هذا مقصوداً فعلاً: SUFRA_SEED_FORCE=1 npm run seed",
  );
  process.exit(1);
}

mkdirSync(dirname(DB_PATH), { recursive: true });
for (const f of [DB_PATH, `${DB_PATH}-wal`, `${DB_PATH}-shm`]) {
  if (existsSync(f)) rmSync(f);
}

const db = new DatabaseSync(DB_PATH);
applySchema(db);

const districts = [
  { id: "ramadi",   ar: "الرمادي", en: "Ramadi",   city: "الرمادي", lat: 33.4258, lng: 43.3089 },
  { id: "fallujah", ar: "الفلوجة", en: "Fallujah", city: "الفلوجة", lat: 33.3506, lng: 43.7789 },
  { id: "hit",      ar: "هيت",     en: "Hit",      city: "هيت",     lat: 33.6386, lng: 42.8256 },
  { id: "haditha",  ar: "حديثة",   en: "Haditha",  city: "حديثة",   lat: 34.1372, lng: 42.3778 },
  { id: "qaim",     ar: "القائم",  en: "Al-Qaim",  city: "القائم",  lat: 34.3667, lng: 41.0917 },
  { id: "anah",     ar: "عنة",     en: "Anah",     city: "عنة",     lat: 34.3683, lng: 41.9889 },
];

const venues: Array<{
  name: string;
  district: string;
  type: "venue" | "restaurant" | "bakery" | "catering";
  dLat: number;
  dLng: number;
  address: string;
}> = [
  { name: "قاعة الفرات للمناسبات", district: "ramadi",   type: "venue",      dLat: 0.008,  dLng: 0.011,  address: "شارع الجمهورية، قرب الجسر القديم" },
  { name: "قاعة النخيل الكبرى",     district: "ramadi",   type: "venue",      dLat: -0.012, dLng: 0.006,  address: "حي التأميم، الشارع العام" },
  { name: "مطعم دجلة والفرات",      district: "ramadi",   type: "restaurant", dLat: 0.004,  dLng: -0.009, address: "شارع المستشفى" },
  { name: "قاعة الرافدين",          district: "fallujah", type: "venue",      dLat: 0.010,  dLng: 0.008,  address: "حي الضباط، قرب الساحة" },
  { name: "قاعة الأندلس",           district: "fallujah", type: "venue",      dLat: -0.007, dLng: 0.013,  address: "شارع الأربعين" },
  { name: "مطعم وگريل الشهبندر",    district: "fallujah", type: "restaurant", dLat: 0.003,  dLng: -0.005, address: "السوق الكبير" },
  { name: "قاعة هيت للأفراح",       district: "hit",      type: "venue",      dLat: 0.006,  dLng: 0.007,  address: "شارع الكورنيش" },
  { name: "مخبز الخير",             district: "hit",      type: "bakery",     dLat: -0.004, dLng: 0.002,  address: "سوق هيت المركزي" },
  { name: "قاعة حديثة الحديثة",     district: "haditha",  type: "venue",      dLat: 0.009,  dLng: -0.006, address: "قرب مجمع الشباب" },
  { name: "مطبخ عنة للولائم",       district: "anah",     type: "catering",   dLat: 0.005,  dLng: 0.004,  address: "الشارع التجاري" },
];

const teams = [
  { name: "فريق الرمادي الأول", district: "ramadi",   vehicle: "van",     containers: 24 },
  { name: "فريق الرمادي الثاني", district: "ramadi",   vehicle: "pickup",  containers: 18 },
  { name: "فريق الفلوجة",        district: "fallujah", vehicle: "van",     containers: 20 },
  { name: "فريق هيت وحديثة",     district: "hit",      vehicle: "pickup",  containers: 16 },
] as const;

const recipientCategories = [
  "family",
  "hospital_companion",
  "day_laborer",
  "student",
  "orphanage",
  "elderly",
] as const;

let phoneCounter = 700_100_000;
const nextPhone = () => `+9647${String(++phoneCounter).slice(0, 9)}`;

db.exec("BEGIN");
try {
  const insDistrict = db.prepare(
    `INSERT INTO districts (id, name_ar, name_en, city, center_lat, center_lng)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  for (const d of districts) insDistrict.run(d.id, d.ar, d.en, d.city, d.lat, d.lng);

  const insUser = db.prepare(
    `INSERT INTO users (id, name, phone, role, district_ids, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'active', ?)`,
  );

  const adminId = randomUUID();
  insUser.run(adminId, "إدارة سُفرة", nextPhone(), "admin", JSON.stringify(districts.map((d) => d.id)), now);

  // منسّق لكل منطقة — نطاق رؤيته منطقته وحدها
  for (const d of districts) {
    insUser.run(randomUUID(), `منسّق ${d.ar}`, nextPhone(), "coordinator", JSON.stringify([d.id]), now);
  }

  // متطوعون: ثلاثة لكل فريق
  const volunteers: Array<{ id: string; district: string }> = [];
  for (const t of teams) {
    for (let i = 1; i <= 3; i++) {
      const id = randomUUID();
      insUser.run(id, `متطوع ${t.name} ${i}`, nextPhone(), "volunteer", JSON.stringify([t.district]), now);
      volunteers.push({ id, district: t.district });
    }
  }

  // جهات مرشِّحة: مختار أو إمام جامع لكل منطقة
  const referrers = districts.map((d) => {
    const id = randomUUID();
    insUser.run(id, `مختار ${d.ar}`, nextPhone(), "referrer", JSON.stringify([d.id]), now);
    return { id, district: d.id };
  });

  const insOrg = db.prepare(
    `INSERT INTO organizations (id, type, name_ar, contact_phone, district_id, address_text,
                                lat, lng, status, food_safety_agreement_signed_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?)`,
  );
  for (const v of venues) {
    const d = districts.find((x) => x.id === v.district)!;
    insOrg.run(
      randomUUID(), v.type, v.name, nextPhone(), v.district, v.address,
      d.lat + v.dLat, d.lng + v.dLng, now, now,
    );
  }

  const insTeam = db.prepare(
    `INSERT INTO teams (id, name, district_id, member_user_ids, vehicle_type, container_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const t of teams) {
    const members = volunteers.filter((v) => v.district === t.district).map((v) => v.id);
    insTeam.run(randomUUID(), t.name, t.district, JSON.stringify(members), t.vehicle, t.containers, now);
  }

  // ٤٠ أسرة. الرمز هو ما يظهر في التقارير — الاسم والعنوان لا يخرجان أبداً.
  const insRecipient = db.prepare(
    `INSERT INTO recipients (id, household_code, household_name, address_text, size, district_id,
                             category, referrer_user_id, verified_at, lat, lng,
                             last_served_at, served_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (let i = 0; i < 40; i++) {
    const d = districts[i % districts.length];
    const ref = referrers.find((r) => r.district === d.id)!;
    const code = `${d.id.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(4, "0")}`;
    // آخر خدمة موزّعة على الأسابيع الماضية ليظهر أثر التدوير فوراً
    const lastServed = i % 7 === 0 ? null : now - (i % 21) * 86_400_000;
    insRecipient.run(
      randomUUID(), code, `أسرة ${code}`, `${d.ar} — عنوان الأسرة ${i + 1}`,
      3 + (i % 8), d.id, recipientCategories[i % recipientCategories.length], ref.id,
      now - 30 * 86_400_000,
      d.lat + (i % 10) * 0.001, d.lng + (i % 8) * 0.001,
      lastServed, lastServed === null ? 0 : (i % 6) + 1, now,
    );
  }

  // مناسبات موزّعة على نافذة اللوحة (الآن حتى ٧٢ ساعة) بحالات مختلفة،
  // حتى تُقرأ اللوحة كما ستُقرأ في التشغيل الحقيقي لا كقائمة فارغة.
  const orgRows = db.prepare("SELECT id, district_id, name_ar FROM organizations").all() as Array<{
    id: string;
    district_id: string;
    name_ar: string;
  }>;

  const plannedEvents: Array<{
    type: "wedding" | "engagement" | "feast" | "funeral" | "other";
    hours: number; // ساعات من الآن حتى انتهاء التقديم
    guests: number;
    district: string;
    withVenue: boolean;
    status: "draft" | "confirmed" | "team_assigned";
    host: string;
    cuisine: string;
  }> = [
    { type: "wedding",    hours: 3,  guests: 450, district: "ramadi",   withVenue: true,  status: "team_assigned", host: "أبو محمد الدليمي",  cuisine: "قوزي ودولمة وتمن — فيه لحم" },
    { type: "funeral",    hours: 5,  guests: 220, district: "fallujah", withVenue: false, status: "confirmed",     host: "أبو عمر الجميلي",   cuisine: "تمن ومرق فاصولياء" },
    { type: "engagement", hours: 8,  guests: 160, district: "ramadi",   withVenue: true,  status: "confirmed",     host: "أم يوسف العيساوي",  cuisine: "برياني دجاج وحلويات" },
    { type: "feast",      hours: 22, guests: 700, district: "fallujah", withVenue: true,  status: "draft",         host: "لجنة جامع الحي",    cuisine: "قوزي وتمن — كمية كبيرة" },
    { type: "wedding",    hours: 27, guests: 520, district: "hit",      withVenue: true,  status: "confirmed",     host: "أبو أحمد الراوي",   cuisine: "مشاوي وتمن ومقبلات" },
    { type: "funeral",    hours: 31, guests: 180, district: "haditha",  withVenue: false, status: "draft",         host: "أبو خالد الحديثي",  cuisine: "تمن ومرق" },
    { type: "wedding",    hours: 46, guests: 380, district: "ramadi",   withVenue: true,  status: "confirmed",     host: "أبو سيف الفهداوي",  cuisine: "قوزي وسلطات وحلويات" },
    { type: "engagement", hours: 50, guests: 120, district: "anah",     withVenue: true,  status: "draft",         host: "أم عبدالله العاني", cuisine: "دولمة وكبة" },
    { type: "feast",      hours: 63, guests: 900, district: "fallujah", withVenue: true,  status: "confirmed",     host: "ديوان آل الجميلي",  cuisine: "قوزي وتمن — وليمة عشائرية" },
    { type: "wedding",    hours: 69, guests: 300, district: "hit",      withVenue: false, status: "draft",         host: "أبو نور الهيتي",    cuisine: "برياني ومشاوي" },
  ];

  const insEvent = db.prepare(
    `INSERT INTO events (id, organization_id, host_user_id, event_type, event_date, expected_guests,
                         cuisine_notes, serving_ends_at, district_id, lat, lng, forecast_surplus_kg,
                         service_fee_iqd, status, unserved_confirmed, unserved_confirmed_by,
                         declaration_signature, declaration_signed_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1, ?, ?, ?, ?)`,
  );

  for (const [i, p] of plannedEvents.entries()) {
    const d = districts.find((x) => x.id === p.district)!;
    const venue = p.withVenue ? orgRows.find((o) => o.district_id === p.district) : undefined;

    const hostId = randomUUID();
    insUser.run(hostId, p.host, nextPhone(), "host", JSON.stringify([p.district]), now);

    const servingEndsAt = now + p.hours * 3_600_000;
    // نفس معادلة الخادم: الضيوف × كغم لكل ضيف × نسبة الفائض
    const forecast = Math.round(p.guests * 0.45 * 0.18 * 10) / 10;

    insEvent.run(
      randomUUID(),
      venue?.id ?? null,
      hostId,
      p.type,
      servingEndsAt,
      p.guests,
      p.cuisine,
      servingEndsAt,
      p.district,
      d.lat + (i % 5) * 0.003,
      d.lng + (i % 4) * 0.004,
      forecast,
      p.status,
      hostId,
      p.host,
      now,
      now - (i + 1) * 3_600_000,
    );
  }

  db.exec("COMMIT");
} catch (err) {
  db.exec("ROLLBACK");
  throw err;
}

const count = (t: string) =>
  Number((db.prepare(`SELECT count(*) c FROM ${t}`).get() as { c: number }).c);

console.log(`✓ ${DB_PATH}`);
for (const t of ["districts", "users", "organizations", "teams", "recipients", "events"]) {
  console.log(`  ${t.padEnd(15)} ${count(t)}`);
}
