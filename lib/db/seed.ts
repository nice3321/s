// بذر بيانات تجريبية واقعية للأنبار. يُشغَّل: npm run seed
// آمن للتكرار — يمسح جداول البذر ويعيد كتابتها، ولا يمسّ audit_log (إلحاق فقط).

import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const DB_PATH = process.env.SUFRA_DB_PATH ?? join(process.cwd(), "data", "sufra.db");
const now = Date.now();

mkdirSync(dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(readFileSync(join(process.cwd(), "lib", "db", "schema.sql"), "utf8"));

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
  // ترتيب المسح يحترم المفاتيح الأجنبية
  for (const t of [
    "deliveries",
    "runs",
    "incidents",
    "batches",
    "listings",
    "events",
    "recipients",
    "teams",
    "organizations",
    "users",
    "districts",
  ]) {
    db.exec(`DELETE FROM ${t}`);
  }

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
  const coordinators = districts.map((d) => {
    const id = randomUUID();
    insUser.run(id, `منسّق ${d.ar}`, nextPhone(), "coordinator", JSON.stringify([d.id]), now);
    return { id, district: d.id };
  });

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

  db.exec("COMMIT");
} catch (err) {
  db.exec("ROLLBACK");
  throw err;
}

const count = (t: string) =>
  Number((db.prepare(`SELECT count(*) c FROM ${t}`).get() as { c: number }).c);

console.log(`✓ ${DB_PATH}`);
for (const t of ["districts", "users", "organizations", "teams", "recipients"]) {
  console.log(`  ${t.padEnd(15)} ${count(t)}`);
}
