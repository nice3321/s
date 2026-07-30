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
  /** نطاق رؤية المنسّق. غيابه يعني كل المناطق — للمشرف وحده. */
  districtIds?: string[];
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
export interface DataProvider {
  listDistricts(): Promise<District[]>;
  getDistrict(id: string): Promise<District | null>;

  /** المنشآت المعتمدة في منطقة، لاختيار القاعة عند تسجيل مناسبة. */
  listOrganizations(districtId?: string): Promise<Organization[]>;

  /** ينشئ المناسبة وصاحبها معاً في معاملة واحدة، ويكتب في سجل التدقيق. */
  createEvent(input: CreateEventInput): Promise<Event>;
  getEvent(id: string): Promise<Event | null>;

  /** مناسبات لوحة المنسّق داخل نافذة زمنية، مرتّبة بانتهاء التقديم. */
  listBoardEvents(query: BoardQuery): Promise<BoardResult>;

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
