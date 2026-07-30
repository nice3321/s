import type { CreateEventInput, District, Event, Organization } from "@/lib/types";

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
}
