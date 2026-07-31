import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { type Actor, districtScope, maySeeHostPhone } from "@/lib/auth/actor";
import { SESSION_TOUCH_MS } from "@/lib/auth/constants";
import { forecastSurplusKg } from "@/lib/config";
import { applySchema } from "@/lib/db/schema";
import type {
  AuditEntry,
  BoardEvent,
  CreateEventInput,
  District,
  Event,
  Organization,
  PartnerApplicationInput,
  PartnerProduct,
} from "@/lib/types";
import type { BoardQuery, BoardResult, Coverage, Credential, DataProvider } from "./provider";

// صفوف SQLite خام — تحويلها إلى أنواع المجال يحصل في الدوال أسفله.
type Row = Record<string, string | number | bigint | null | Uint8Array>;

const num = (v: Row[string]): number => Number(v);
const str = (v: Row[string]): string => String(v);
const nullableStr = (v: Row[string]): string | null => (v === null ? null : String(v));
const nullableNum = (v: Row[string]): number | null => (v === null ? null : Number(v));

function toDistrict(r: Row): District {
  return {
    id: str(r.id),
    nameAr: str(r.name_ar),
    nameEn: str(r.name_en),
    city: str(r.city),
    centerLat: num(r.center_lat),
    centerLng: num(r.center_lng),
    kgPerGuest: num(r.kg_per_guest),
    surplusRate: num(r.surplus_rate),
  };
}

function toOrganization(r: Row): Organization {
  return {
    id: str(r.id),
    type: str(r.type) as Organization["type"],
    nameAr: str(r.name_ar),
    contactPhone: str(r.contact_phone),
    districtId: str(r.district_id),
    addressText: str(r.address_text),
    lat: num(r.lat),
    lng: num(r.lng),
    status: str(r.status) as Organization["status"],
    foodSafetyAgreementSignedAt: nullableNum(r.food_safety_agreement_signed_at),
  };
}

function toEvent(r: Row): Event {
  return {
    id: str(r.id),
    organizationId: nullableStr(r.organization_id),
    hostUserId: str(r.host_user_id),
    eventType: str(r.event_type) as Event["eventType"],
    eventDate: num(r.event_date),
    expectedGuests: num(r.expected_guests),
    cuisineNotes: nullableStr(r.cuisine_notes),
    servingEndsAt: num(r.serving_ends_at),
    districtId: str(r.district_id),
    lat: num(r.lat),
    lng: num(r.lng),
    forecastSurplusKg: num(r.forecast_surplus_kg),
    serviceFeeIqd: num(r.service_fee_iqd),
    status: str(r.status) as Event["status"],
    unservedConfirmed: num(r.unserved_confirmed) === 1,
    unservedConfirmedBy: nullableStr(r.unserved_confirmed_by),
    declarationSignature: nullableStr(r.declaration_signature),
    declarationSignedAt: nullableNum(r.declaration_signed_at),
    createdAt: num(r.created_at),
  };
}

export class SqliteProvider implements DataProvider {
  private readonly db: DatabaseSync;

  constructor(dbPath: string) {
    mkdirSync(dirname(dbPath), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    applySchema(this.db);
  }

  /**
   * إلحاق في سجل التدقيق. القاعدة ٦ — كل تغيير حالة يُسجَّل.
   *
   * العمودان `before_json` و`after_json` يحملان **أسماء الحقول المتغيّرة**
   * وبيانات غير شخصية فقط. الجدول لا يُعدَّل ولا يُحذف، فأي PII يدخله يبقى أبداً.
   */
  private appendAudit(entry: AuditEntry): void {
    const after =
      entry.changedFields || entry.meta
        ? JSON.stringify({
            ...(entry.changedFields ? { fields: entry.changedFields } : {}),
            ...(entry.meta ?? {}),
          })
        : null;

    this.db
      .prepare(
        `INSERT INTO audit_log (id, actor_user_id, entity_type, entity_id, action, before_json, after_json, created_at)
         VALUES (?, ?, ?, ?, ?, NULL, ?, ?)`,
      )
      .run(
        randomUUID(),
        entry.actorUserId,
        entry.entityType,
        entry.entityId,
        entry.action,
        after,
        Date.now(),
      );
  }

  // ── المصادقة ────────────────────────────────────────────────────────────

  async findCredentialByPhone(phone: string): Promise<Credential | null> {
    const row = this.db
      .prepare(
        `SELECT u.id, u.role, u.district_ids, c.password_hash, c.failed_attempts, c.locked_until
           FROM users u JOIN user_credentials c ON c.user_id = u.id
          WHERE u.phone = ? AND u.deleted_at IS NULL AND u.status = 'active'`,
      )
      .get(phone) as Row | undefined;
    if (!row) return null;

    return {
      userId: str(row.id),
      role: str(row.role),
      districtIds: JSON.parse(str(row.district_ids)) as string[],
      passwordHash: str(row.password_hash),
      failedAttempts: num(row.failed_attempts),
      lockedUntil: nullableNum(row.locked_until),
    };
  }

  async setPassword(userId: string, passwordHash: string): Promise<void> {
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO user_credentials (user_id, password_hash, password_set_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           password_hash = excluded.password_hash,
           failed_attempts = 0, locked_until = NULL, updated_at = excluded.updated_at`,
      )
      .run(userId, passwordHash, now, now);

    this.appendAudit({
      actorUserId: userId,
      entityType: "user_credential",
      entityId: userId,
      action: "set_password",
      changedFields: ["password_hash"],
    });
  }

  async recordLoginFailure(userId: string, lockAfter: number, lockMs: number): Promise<void> {
    // القفل في القاعدة لا في الذاكرة: ينجو من إعادة تشغيل الحاوية.
    this.db
      .prepare(
        `UPDATE user_credentials
            SET failed_attempts = failed_attempts + 1,
                locked_until = CASE WHEN failed_attempts + 1 >= ? THEN ? ELSE locked_until END,
                updated_at = ?
          WHERE user_id = ?`,
      )
      .run(lockAfter, Date.now() + lockMs, Date.now(), userId);
  }

  async clearLoginFailures(userId: string): Promise<void> {
    this.db
      .prepare(
        `UPDATE user_credentials SET failed_attempts = 0, locked_until = NULL, updated_at = ?
          WHERE user_id = ?`,
      )
      .run(Date.now(), userId);
  }

  async createSession(sessionId: string, userId: string, ttlMs: number): Promise<void> {
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO sessions (id, user_id, created_at, expires_at, last_seen_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(sessionId, userId, now, now + ttlMs, now);
  }

  async getActorBySessionId(sessionId: string): Promise<Actor | null> {
    const row = this.db
      .prepare(
        `SELECT u.id, u.role, u.district_ids
           FROM sessions s JOIN users u ON u.id = s.user_id
          WHERE s.id = ? AND s.revoked_at IS NULL AND s.expires_at > ?
            AND u.deleted_at IS NULL AND u.status = 'active'`,
      )
      .get(sessionId, Date.now()) as Row | undefined;
    if (!row) return null;

    return {
      userId: str(row.id),
      role: str(row.role) as Actor["role"],
      districtIds: JSON.parse(str(row.district_ids)) as string[],
      // عضوية المنشآت تصل مع جدول org_members في مرحلة الطلبات. اليوم فارغة
      // **عمداً** بدل تخمين ملكية: الرفع يرفض حين تكون فارغة، وهذا أسلم من
      // منح ملكية بالاستنتاج.
      orgIds: [],
    };
  }

  async touchSession(sessionId: string, ttlMs: number): Promise<void> {
    const now = Date.now();
    // مرّة كل ساعة على الأكثر — وإلا صار كل عرض صفحة كتابةً
    this.db
      .prepare(
        `UPDATE sessions SET last_seen_at = ?, expires_at = ?
          WHERE id = ? AND last_seen_at < ?`,
      )
      .run(now, now + ttlMs, sessionId, now - SESSION_TOUCH_MS);
  }

  async revokeSession(sessionId: string): Promise<void> {
    this.db.prepare("UPDATE sessions SET revoked_at = ? WHERE id = ?").run(Date.now(), sessionId);
  }

  async listDistricts(): Promise<District[]> {
    const rows = this.db
      .prepare("SELECT * FROM districts WHERE deleted_at IS NULL ORDER BY name_ar")
      .all() as Row[];
    return rows.map(toDistrict);
  }

  async getDistrict(id: string): Promise<District | null> {
    const row = this.db
      .prepare("SELECT * FROM districts WHERE id = ? AND deleted_at IS NULL")
      .get(id) as Row | undefined;
    return row ? toDistrict(row) : null;
  }

  async listOrganizations(districtId?: string): Promise<Organization[]> {
    const rows = districtId
      ? (this.db
          .prepare(
            `SELECT * FROM organizations
             WHERE deleted_at IS NULL AND status = 'approved' AND district_id = ?
             ORDER BY name_ar`,
          )
          .all(districtId) as Row[])
      : (this.db
          .prepare(
            `SELECT * FROM organizations
             WHERE deleted_at IS NULL AND status = 'approved'
             ORDER BY name_ar`,
          )
          .all() as Row[]);
    return rows.map(toOrganization);
  }

  async createEvent(input: CreateEventInput): Promise<Event> {
    const district = await this.getDistrict(input.districtId);
    if (!district) throw new Error("district_not_found");

    // التوقّع يُحسب على الخادم بثوابت المنطقة — لا نثق بأي رقم قادم من المتصفح.
    const forecast = forecastSurplusKg(
      input.expectedGuests,
      district.kgPerGuest,
      district.surplusRate,
    );

    const now = Date.now();
    const eventId = randomUUID();

    this.db.exec("BEGIN");
    try {
      // صاحب المناسبة يُعرَّف برقم هاتفه. رقم معروف يُعاد استعماله بدل إنشاء تكرار.
      const existing = this.db
        .prepare("SELECT id FROM users WHERE phone = ? AND deleted_at IS NULL")
        .get(input.hostPhone) as Row | undefined;

      let hostUserId: string;
      if (existing) {
        hostUserId = str(existing.id);
      } else {
        hostUserId = randomUUID();
        this.db
          .prepare(
            `INSERT INTO users (id, name, phone, role, district_ids, status, created_at)
             VALUES (?, ?, ?, 'host', ?, 'active', ?)`,
          )
          .run(hostUserId, input.hostName, input.hostPhone, JSON.stringify([input.districtId]), now);
        this.appendAudit({
          actorUserId: hostUserId,
          entityType: "user",
          entityId: hostUserId,
          action: "create",
          // الاسم والهاتف في صفّ users نفسه — لا هنا، فهذا الجدول لا يُشطب منه
          changedFields: ["name", "phone", "role"],
          meta: { role: "host" },
        });
      }

      this.db
        .prepare(
          `INSERT INTO events (
             id, organization_id, host_user_id, event_type, event_date, expected_guests,
             cuisine_notes, serving_ends_at, district_id, lat, lng, forecast_surplus_kg,
             service_fee_iqd, status, unserved_confirmed, unserved_confirmed_by,
             declaration_signature, declaration_signed_at, created_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'draft', 1, ?, ?, ?, ?)`,
        )
        .run(
          eventId,
          input.organizationId,
          hostUserId,
          input.eventType,
          input.eventDate,
          input.expectedGuests,
          input.cuisineNotes,
          input.servingEndsAt,
          input.districtId,
          input.lat,
          input.lng,
          forecast,
          hostUserId,
          input.declarationSignature.trim(),
          now,
          now,
        );

      this.appendAudit({
        actorUserId: hostUserId,
        entityType: "event",
        entityId: eventId,
        action: "create",
        meta: { status: "draft", forecastSurplusKg: forecast, districtId: input.districtId },
      });

      this.db.exec("COMMIT");
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err;
    }

    const created = await this.getEvent(eventId);
    if (!created) throw new Error("event_not_found_after_insert");
    return created;
  }

  async getEvent(id: string): Promise<Event | null> {
    const row = this.db
      .prepare("SELECT * FROM events WHERE id = ? AND deleted_at IS NULL")
      .get(id) as Row | undefined;
    return row ? toEvent(row) : null;
  }

  async listBoardEvents(actor: Actor, query: BoardQuery): Promise<BoardResult> {
    const windowStart = Date.now();
    // النطاق من الفاعل حصراً. غير المشرف بلا مناطق يرى صفراً — لا «كل شيء».
    const scope = districtScope(actor);
    const scoped = scope !== null;
    const placeholders = scoped ? scope.map(() => "?").join(",") : "";

    const rows = this.db
      .prepare(
        `SELECT e.id, e.event_type, e.event_date, e.expected_guests, e.serving_ends_at,
                e.forecast_surplus_kg, e.status, e.district_id,
                d.name_ar AS district_name_ar,
                o.name_ar AS organization_name_ar,
                u.name    AS host_name,
                u.phone   AS host_phone
           FROM events e
           JOIN districts d     ON d.id = e.district_id
           JOIN users u         ON u.id = e.host_user_id
           LEFT JOIN organizations o ON o.id = e.organization_id
          WHERE e.deleted_at IS NULL
            AND e.status <> 'cancelled'
            AND e.serving_ends_at BETWEEN ? AND ?
            ${scoped ? `AND e.district_id IN (${placeholders})` : ""}
          ORDER BY e.serving_ends_at`,
      )
      .all(windowStart, windowStart + query.windowMs, ...(scoped ? scope : [])) as Row[];

    const events = rows.map((r) => ({
      id: str(r.id),
      eventType: str(r.event_type) as BoardEvent["eventType"],
      eventDate: num(r.event_date),
      expectedGuests: num(r.expected_guests),
      servingEndsAt: num(r.serving_ends_at),
      forecastSurplusKg: num(r.forecast_surplus_kg),
      status: str(r.status) as BoardEvent["status"],
      districtId: str(r.district_id),
      districtNameAr: str(r.district_name_ar),
      organizationNameAr: nullableStr(r.organization_name_ar),
      hostName: str(r.host_name),
      // الرقم يُحذف من الكائن نفسه لمن لا يتصل — لا يُرسل ثم يُخفى.
      hostPhone: maySeeHostPhone(actor, str(r.district_id)) ? str(r.host_phone) : null,
    }));

    return { windowStart, events };
  }

  async createPartnerApplication(input: PartnerApplicationInput): Promise<string> {
    const id = randomUUID();
    const now = Date.now();

    this.db
      .prepare(
        `INSERT INTO partner_applications (id, applicant_role, business_name, business_type,
           contact_name, phone, district_id, address_text, message, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      )
      .run(
        id,
        input.applicantRole,
        input.businessName,
        input.businessType,
        input.contactName,
        input.phone,
        input.districtId,
        input.addressText,
        input.message,
        now,
      );

    this.appendAudit({
      actorUserId: null,
      entityType: "partner_application",
      entityId: id,
      action: "create",
      // اسم المنشأة والهاتف في صفّ partner_applications — لا في سجل لا يُشطب
      changedFields: ["business_name", "contact_name", "phone"],
      meta: { businessType: input.businessType, districtId: input.districtId },
    });

    return id;
  }

  async listPartnerProducts(organizationId?: string): Promise<PartnerProduct[]> {
    const where = organizationId ? "AND p.organization_id = ?" : "";
    const rows = this.db
      .prepare(
        `SELECT p.id, p.organization_id, p.title_ar, p.file_name, p.created_at,
                o.name_ar AS organization_name_ar
           FROM partner_products p
           JOIN organizations o ON o.id = p.organization_id
          WHERE p.deleted_at IS NULL ${where}
          ORDER BY p.created_at DESC`,
      )
      .all(...(organizationId ? [organizationId] : [])) as Row[];

    return rows.map((r) => ({
      id: str(r.id),
      organizationId: str(r.organization_id),
      organizationNameAr: str(r.organization_name_ar),
      titleAr: str(r.title_ar),
      fileName: str(r.file_name),
      createdAt: num(r.created_at),
    }));
  }

  async addPartnerProduct(input: {
    organizationId: string;
    titleAr: string;
    fileName: string;
    mime: string;
    bytes: number;
  }): Promise<PartnerProduct> {
    const id = randomUUID();
    const now = Date.now();

    this.db
      .prepare(
        `INSERT INTO partner_products (id, organization_id, title_ar, file_name, mime, bytes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(id, input.organizationId, input.titleAr, input.fileName, input.mime, input.bytes, now);

    this.appendAudit({
      actorUserId: null,
      entityType: "partner_product",
      entityId: id,
      action: "create",
      meta: { organizationId: input.organizationId, fileName: input.fileName },
    });

    const org = this.db
      .prepare("SELECT name_ar FROM organizations WHERE id = ?")
      .get(input.organizationId) as Row | undefined;

    return {
      id,
      organizationId: input.organizationId,
      organizationNameAr: org ? str(org.name_ar) : "",
      titleAr: input.titleAr,
      fileName: input.fileName,
      createdAt: now,
    };
  }

  async getCoverage(): Promise<Coverage> {
    const one = (sql: string): number =>
      Number((this.db.prepare(sql).get() as { c: number | bigint }).c);

    return {
      districts: one("SELECT count(*) c FROM districts WHERE deleted_at IS NULL"),
      organizations: one(
        "SELECT count(*) c FROM organizations WHERE deleted_at IS NULL AND status = 'approved'",
      ),
      teams: one("SELECT count(*) c FROM teams WHERE deleted_at IS NULL"),
      households: one("SELECT count(*) c FROM recipients WHERE deleted_at IS NULL"),
    };
  }
}
