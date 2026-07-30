"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getDictionary } from "@/lib/i18n";
import type { BusinessType, District, Organization } from "@/lib/types";
import { ACCEPTED_MIME } from "@/lib/uploads-shared";
import {
  submitPartnerApplication,
  uploadProductPhoto,
  type ApplicationState,
  type UploadState,
} from "./actions";

const t = getDictionary();

const BUSINESS_TYPES: BusinessType[] = [
  "restaurant",
  "bakery",
  "cafe",
  "grocery",
  "venue",
  "other",
];

const ROLES = [
  { value: "owner", label: t.partners.form.roleOwner },
  { value: "staff", label: t.partners.form.roleStaff },
  { value: "referral", label: t.partners.form.roleReferral },
] as const;

export function ApplicationForm({ districts }: { districts: District[] }) {
  const [state, formAction, pending] = useActionState<ApplicationState, FormData>(
    submitPartnerApplication,
    { status: "idle" },
  );

  const errors = state.status === "error" ? state.errors : {};
  const err = (k: string) => {
    const key = errors[k];
    return key ? ((t.error as Record<string, string>)[key] ?? t.error.generic) : undefined;
  };

  if (state.status === "success") {
    return (
      <div className="surface p-8 text-center">
        <h3 className="font-display text-2xl text-ink">{t.partners.form.successTitle}</h3>
        <p className="mt-3 leading-relaxed text-ink/65">{t.partners.form.successBody}</p>
        <Button
          render={<a href="/partners#apply" />}
          nativeButton={false}
          variant="outline"
          className="tap mt-7"
        >
          {t.partners.form.another}
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="surface space-y-6 p-7 sm:p-9">
      <Field label={t.partners.form.role} error={err("applicantRole")}>
        <Select name="applicantRole" defaultValue="owner">
          <SelectTrigger className="tap w-full">
            <SelectValue>
              {(v: string) => ROLES.find((r) => r.value === v)?.label ?? ""}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t.partners.form.businessName} error={err("businessName")}>
          <Input name="businessName" required className="tap" />
        </Field>

        <Field label={t.partners.form.businessType} error={err("businessType")}>
          <Select name="businessType" defaultValue="restaurant">
            <SelectTrigger className="tap w-full">
              <SelectValue>{(v: BusinessType) => t.partners.businessType[v]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPES.map((b) => (
                <SelectItem key={b} value={b}>
                  {t.partners.businessType[b]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={t.partners.form.contactName} error={err("contactName")}>
          <Input name="contactName" required className="tap" autoComplete="name" />
        </Field>

        <Field label={t.partners.form.phone} error={err("phone")}>
          <Input
            name="phone"
            type="tel"
            required
            dir="ltr"
            inputMode="tel"
            placeholder="+964 770 123 4567"
            className="tap tnum"
            autoComplete="tel"
          />
        </Field>
      </div>

      <Field label={t.partners.form.district} error={err("districtId")}>
        <Select name="districtId" defaultValue={districts[0]?.id ?? ""}>
          <SelectTrigger className="tap w-full">
            <SelectValue>
              {(v: string) => districts.find((d) => d.id === v)?.nameAr ?? ""}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.nameAr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label={t.partners.form.address}>
        <Input name="addressText" className="tap" />
      </Field>

      <Field label={t.partners.form.message}>
        <Textarea name="message" rows={3} className="text-base" />
      </Field>

      {err("generic") && (
        <p className="text-center font-medium text-destructive">{err("generic")}</p>
      )}

      <Button type="submit" disabled={pending} className="tap h-14 w-full text-lg">
        {pending ? t.partners.form.submitting : t.partners.form.submit}
      </Button>
    </form>
  );
}

export function ProductUploadForm({ organizations }: { organizations: Organization[] }) {
  const [state, formAction, pending] = useActionState<UploadState, FormData>(uploadProductPhoto, {
    status: "idle",
  });
  const formRef = useRef<HTMLFormElement>(null);

  const message =
    state.status === "error"
      ? ((t.uploadError as Record<string, string>)[state.error] ?? t.uploadError.generic)
      : null;

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        formRef.current?.reset();
      }}
      className="surface space-y-6 p-7 sm:p-9"
    >
      <Field label={t.partners.uploadOrg}>
        <Select name="organizationId" defaultValue={organizations[0]?.id ?? ""}>
          <SelectTrigger className="tap w-full">
            <SelectValue>
              {(v: string) => organizations.find((o) => o.id === v)?.nameAr ?? ""}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {organizations.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.nameAr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label={t.partners.uploadName}>
        <Input name="titleAr" required className="tap" placeholder="قوزي بالتمن" />
      </Field>

      <Field label={t.partners.uploadFile} hint={t.partners.uploadHint}>
        <Input
          name="file"
          type="file"
          required
          accept={ACCEPTED_MIME.join(",")}
          className="tap py-2.5 file:me-3 file:rounded-lg file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:text-gypsum"
        />
      </Field>

      {message && <p className="font-medium text-destructive">{message}</p>}
      {state.status === "success" && (
        <p className="font-medium text-ink">{t.partners.uploadSuccess}</p>
      )}

      <Button type="submit" disabled={pending} className="tap h-14 w-full text-lg">
        {pending ? t.partners.uploadPending : t.partners.uploadSubmit}
      </Button>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-base">{label}</Label>
      {children}
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
