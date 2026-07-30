"use server";

import { getProvider } from "@/lib/data";
import { baghdadToEpoch, newEventSchema } from "@/lib/validation";

export type NewEventState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string> }
  | { status: "success"; eventId: string; forecastKg: number };

/** يقرأ حقلاً من النموذج كنص. الصناديق غير المؤشَّرة تغيب عن FormData أصلاً. */
const field = (fd: FormData, name: string): string => String(fd.get(name) ?? "");

export async function createEventAction(
  _prev: NewEventState,
  formData: FormData,
): Promise<NewEventState> {
  const parsed = newEventSchema.safeParse({
    hostName: field(formData, "hostName"),
    hostPhone: field(formData, "hostPhone"),
    organizationId: field(formData, "organizationId"),
    eventType: field(formData, "eventType"),
    eventDate: field(formData, "eventDate"),
    servingEndsTime: field(formData, "servingEndsTime"),
    expectedGuests: field(formData, "expectedGuests"),
    cuisineNotes: field(formData, "cuisineNotes"),
    districtId: field(formData, "districtId"),
    lat: field(formData, "lat"),
    lng: field(formData, "lng"),
    declUnserved: field(formData, "declUnserved"),
    declAccess: field(formData, "declAccess"),
    declNoSale: field(formData, "declNoSale"),
    declarationSignature: field(formData, "declarationSignature"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "generic");
      errors[key] ??= issue.message;
    }
    return { status: "error", errors };
  }

  const v = parsed.data;

  try {
    // التوقّع يُحسب داخل المزوّد بثوابت المنطقة — ما يُرسله المتصفح عرضٌ فقط.
    const event = await getProvider().createEvent({
      hostName: v.hostName,
      hostPhone: v.hostPhone,
      organizationId: v.organizationId,
      eventType: v.eventType,
      eventDate: baghdadToEpoch(v.eventDate, "00:00"),
      expectedGuests: v.expectedGuests,
      cuisineNotes: v.cuisineNotes,
      servingEndsAt: baghdadToEpoch(v.eventDate, v.servingEndsTime),
      districtId: v.districtId,
      lat: v.lat,
      lng: v.lng,
      declarationSignature: v.declarationSignature,
    });

    return { status: "success", eventId: event.id, forecastKg: event.forecastSurplusKg };
  } catch {
    return { status: "error", errors: { generic: "generic" } };
  }
}
