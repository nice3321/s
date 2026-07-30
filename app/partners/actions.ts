"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProvider } from "@/lib/data";
import { saveProductImage } from "@/lib/uploads";
import { normalizeIraqiPhone } from "@/lib/validation";

const field = (fd: FormData, name: string): string => String(fd.get(name) ?? "");

// ── طلب الانضمام ────────────────────────────────────────────────────────────

const applicationSchema = z.object({
  applicantRole: z.enum(["owner", "staff", "referral"], { message: "required" }),
  businessName: z.string().trim().min(2, { message: "required" }).max(120),
  businessType: z.enum(["restaurant", "bakery", "cafe", "grocery", "venue", "other"], {
    message: "required",
  }),
  contactName: z.string().trim().min(3, { message: "required" }).max(120),
  phone: z
    .string()
    .transform((v) => normalizeIraqiPhone(v))
    .refine((v): v is string => v !== null, { message: "phoneInvalid" }),
  districtId: z.string().trim().min(1, { message: "districtInvalid" }),
  addressText: z
    .string()
    .trim()
    .max(300)
    .transform((v) => (v === "" ? null : v)),
  message: z
    .string()
    .trim()
    .max(1000)
    .transform((v) => (v === "" ? null : v)),
});

export type ApplicationState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string> }
  | { status: "success" };

export async function submitPartnerApplication(
  _prev: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  const parsed = applicationSchema.safeParse({
    applicantRole: field(formData, "applicantRole"),
    businessName: field(formData, "businessName"),
    businessType: field(formData, "businessType"),
    contactName: field(formData, "contactName"),
    phone: field(formData, "phone"),
    districtId: field(formData, "districtId"),
    addressText: field(formData, "addressText"),
    message: field(formData, "message"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0] ?? "generic")] ??= issue.message;
    }
    return { status: "error", errors };
  }

  try {
    await getProvider().createPartnerApplication(parsed.data);
    return { status: "success" };
  } catch {
    return { status: "error", errors: { generic: "generic" } };
  }
}

// ── رفع صورة منتج ───────────────────────────────────────────────────────────

export type UploadState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | { status: "success" };

export async function uploadProductPhoto(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const organizationId = field(formData, "organizationId");
  const titleAr = field(formData, "titleAr").trim();
  const file = formData.get("file");

  if (!organizationId) return { status: "error", error: "org_required" };
  if (titleAr.length < 2) return { status: "error", error: "title_required" };
  if (!(file instanceof File)) return { status: "error", error: "empty" };

  // ⚠ لا مصادقة بعد: أي زائر يستطيع الرفع باسم أي منشأة.
  // حين تصل المصادقة، تُستبدل organizationId القادمة من النموذج بمنشأة الجلسة.
  const saved = await saveProductImage(file);
  if (!saved.ok) return { status: "error", error: saved.error };

  try {
    await getProvider().addPartnerProduct({
      organizationId,
      titleAr,
      fileName: saved.fileName,
      mime: saved.mime,
      bytes: saved.bytes,
    });
  } catch {
    return { status: "error", error: "generic" };
  }

  revalidatePath("/partners");
  return { status: "success" };
}
