import type { Actor } from "@/lib/auth/actor";
import type {
  BoardEvent,
  CreateEventInput,
  District,
  Event,
  Organization,
  PartnerApplicationInput,
  PartnerProduct,
} from "@/lib/types";

export interface BoardQuery {
  /** طول النافذة من الآن. الآن يُقرأ داخل المزوّد لا في المكوّن. */
  windowMs: number;
}

export interface BoardResult {
  windowStart: number;
  events: BoardEvent[];
}

/** أرقام التغطية المعروضة في الصفحة الرئيسية — من القاعدة، لا ثوابت مكتوبة. */
export interface Coverage {
  districts: number;
  organizations: number;
  teams: number;
  households: number;
}

/**
 * واجهة الوصول للبيانات. المكوّنات وإجراءات الخادم تتعامل مع هذه الواجهة فقط،
 * ولا تستورد كود قاعدة البيانات مباشرة. استبدال SQLite بمزوّد آخر لاحقاً
 * يعني كتابة صنف جديد هنا لا غير.
 *
 * تنمو الواجهة مع الشاشات المبنيّة فعلاً — لا نعرّف توابع لشاشات لم تُبنَ بعد.
 */
/** ما يلزم لتسجيل الدخول: المستخدم وتجزئته وحالة قفله. */
export interface Credential {
  userId: string;
  role: string;
  districtIds: string[];
  passwordHash: string;
  failedAttempts: number;
  lockedUntil: number | null;
}

export interface DataProvider {
  // ── المصادقة ──────────────────────────────────────────────────────────────
  findCredentialByPhone(phone: string): Promise<Credential | null>;
  setPassword(userId: string, passwordHash: string): Promise<void>;
  recordLoginFailure(userId: string, lockAfter: number, lockMs: number): Promise<void>;
  clearLoginFailures(userId: string): Promise<void>;

  createSession(sessionId: string, userId: string, ttlMs: number): Promise<void>;
  /** يعيد الفاعل من تجزئة الرمز، أو null لجلسة غائبة أو منتهية أو مُبطَلة. */
  getActorBySessionId(sessionId: string): Promise<Actor | null>;
  touchSession(sessionId: string, ttlMs: number): Promise<void>;
  revokeSession(sessionId: string): Promise<void>;

  listDistricts(): Promise<District[]>;
  getDistrict(id: string): Promise<District | null>;

  /** المنشآت المعتمدة في منطقة، لاختيار القاعة عند تسجيل مناسبة. */
  listOrganizations(districtId?: string): Promise<Organization[]>;

  /** ينشئ المناسبة وصاحبها معاً في معاملة واحدة، ويكتب في سجل التدقيق. */
  createEvent(input: CreateEventInput): Promise<Event>;
  getEvent(id: string): Promise<Event | null>;

  /**
   * مناسبات لوحة المنسّق داخل نافذة زمنية، مرتّبة بانتهاء التقديم.
   * النطاق يُشتق من `actor` — لا يقبل هذا التابع نطاقاً من المُستدعي.
   */
  listBoardEvents(actor: Actor, query: BoardQuery): Promise<BoardResult>;

  getCoverage(): Promise<Coverage>;

  /** طلب انضمام شريك جديد. يعود بمعرّف الطلب. */
  createPartnerApplication(input: PartnerApplicationInput): Promise<string>;

  /** صور منتجات الشركاء — كلها أو لشريك واحد. */
  listPartnerProducts(organizationId?: string): Promise<PartnerProduct[]>;

  /** يُستدعى بعد حفظ الملف على القرص؛ الاسم مُولَّد في الخادم لا من المتصفح. */
  addPartnerProduct(input: {
    organizationId: string;
    titleAr: string;
    fileName: string;
    mime: string;
    bytes: number;
  }): Promise<PartnerProduct>;
}
