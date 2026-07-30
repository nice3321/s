// أنواع المجال. كل الأوقات ميلي ثانية UTC، وكل المبالغ دينار عراقي صحيح.

export type Role =
  | "admin"
  | "coordinator"
  | "host"
  | "merchant"
  | "volunteer"
  | "referrer"
  | "viewer";

export type EventType = "wedding" | "engagement" | "feast" | "funeral" | "other";

export type EventStatus =
  | "draft"
  | "confirmed"
  | "team_assigned"
  | "collected"
  | "closed"
  | "cancelled";

export type OrganizationType = "venue" | "restaurant" | "bakery" | "catering" | "charity";

export type SourceType = "event" | "commercial";

export interface District {
  id: string;
  nameAr: string;
  nameEn: string;
  city: string;
  centerLat: number;
  centerLng: number;
  /** ثابتا نموذج التوقّع، قابلان للضبط لكل منطقة */
  kgPerGuest: number;
  surplusRate: number;
}

export interface Organization {
  id: string;
  type: OrganizationType;
  nameAr: string;
  contactPhone: string;
  districtId: string;
  addressText: string;
  lat: number;
  lng: number;
  status: "pending" | "approved" | "suspended";
  foodSafetyAgreementSignedAt: number | null;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  districtIds: string[];
  status: "active" | "suspended";
  createdAt: number;
}

export interface Event {
  id: string;
  organizationId: string | null;
  hostUserId: string;
  eventType: EventType;
  eventDate: number;
  expectedGuests: number;
  cuisineNotes: string | null;
  servingEndsAt: number;
  districtId: string;
  lat: number;
  lng: number;
  forecastSurplusKg: number;
  serviceFeeIqd: number;
  status: EventStatus;
  unservedConfirmed: boolean;
  unservedConfirmedBy: string | null;
  declarationSignature: string | null;
  declarationSignedAt: number | null;
  createdAt: number;
}

export interface AuditEntry {
  actorUserId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  before: unknown;
  after: unknown;
}

/** ما تحتاجه شاشة تسجيل المناسبة لإنشاء مناسبة وصاحبها معاً. */
export interface CreateEventInput {
  hostName: string;
  hostPhone: string;
  organizationId: string | null;
  eventType: EventType;
  eventDate: number;
  expectedGuests: number;
  cuisineNotes: string | null;
  servingEndsAt: number;
  districtId: string;
  lat: number;
  lng: number;
  declarationSignature: string;
}
