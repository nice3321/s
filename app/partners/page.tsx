import { Recycle, TrendingUp, Trophy, Users } from "lucide-react";
import Image from "next/image";
import { Damma } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { getProvider } from "@/lib/data";
import { fmtNumber } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import { ApplicationForm, ProductUploadForm } from "./partner-forms";

export const dynamic = "force-dynamic";

const t = getDictionary();

export const metadata = { title: t.partners.metaTitle };

const benefits = [
  { Icon: Recycle, title: t.partners.benefit.wasteTitle, body: t.partners.benefit.wasteBody },
  { Icon: TrendingUp, title: t.partners.benefit.revenueTitle, body: t.partners.benefit.revenueBody },
  { Icon: Users, title: t.partners.benefit.customersTitle, body: t.partners.benefit.customersBody },
  { Icon: Trophy, title: t.partners.benefit.reputationTitle, body: t.partners.benefit.reputationBody },
] as const;

const steps = [t.partners.step1, t.partners.step2, t.partners.step3];

export default async function PartnersPage() {
  const provider = getProvider();
  const [coverage, districts, organizations, products] = await Promise.all([
    provider.getCoverage(),
    provider.listDistricts(),
    provider.listOrganizations(),
    provider.listPartnerProducts(),
  ]);

  const stats = [
    { value: coverage.organizations, label: t.home.coverage.organizations },
    { value: coverage.districts, label: t.home.coverage.districts },
    { value: coverage.teams, label: t.home.coverage.teams },
    { value: coverage.households, label: t.home.coverage.households },
  ];

  return (
    <main id="main" className="flex-1 overflow-hidden">
      {/* ── البطل ── */}
      <section className="relative isolate">
        <Damma className="pointer-events-none absolute -start-24 top-4 -z-10 size-[26rem] rotate-12 text-saffron/8" />
        <div className="mx-auto w-full max-w-6xl px-4 pt-20 pb-16 lg:px-8">
          <p className="text-sm font-semibold text-saffron">{t.partners.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.3] text-ink sm:text-5xl sm:leading-[1.25]">
            {t.partners.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">{t.partners.lead}</p>

          <Button
            render={<a href="#apply" />}
            nativeButton={false}
            className="tap mt-9 h-14 px-8 text-lg"
          >
            {t.partners.cta}
          </Button>
        </div>
      </section>

      {/* ── أرقام حيّة ── */}
      <section className="bg-ink text-gypsum">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 lg:px-8">
          <h2 className="text-2xl">{t.partners.statsTitle}</h2>
          <p className="mt-2 text-sm text-gypsum/55">{t.partners.statsNote}</p>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="tnum block font-mono text-5xl font-semibold text-saffron">
                    {fmtNumber(s.value)}
                  </span>
                  <span className="mt-2 block text-sm leading-snug text-gypsum/70">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── المنافع ── */}
      <section className="border-b border-border bg-card/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 lg:px-8">
          <h2 className="text-3xl text-ink">{t.partners.benefitsTitle}</h2>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {benefits.map(({ Icon, title, body }) => (
              <li key={title} className="surface lift p-7">
                <span className="flex size-12 items-center justify-center rounded-xl bg-saffron/12 text-saffron">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl leading-snug text-ink">{title}</h3>
                <p className="mt-2.5 leading-relaxed text-ink/65">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── الخطوات ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 lg:px-8">
        <h2 className="text-3xl text-ink">{t.partners.stepsTitle}</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-card font-mono text-lg font-semibold text-saffron"
              >
                {i + 1}
              </span>
              <p className="pt-2 leading-relaxed text-ink/70">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── معرض منتجات الشركاء ── */}
      <section className="border-y border-border bg-card/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 lg:px-8">
          <h2 className="text-3xl text-ink">{t.partners.galleryTitle}</h2>

          {products.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-border bg-gypsum px-6 py-14 text-center text-ink/55">
              {t.partners.galleryEmpty}
            </p>
          ) : (
            <ul className="mt-9 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <li key={p.id} className="surface overflow-hidden">
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={`/media/${p.fileName}`}
                      alt={p.titleAr}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-ink">{p.titleAr}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.organizationNameAr}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── الرفع والطلب ── */}
      <section id="apply" className="scroll-mt-20">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl text-ink">{t.partners.form.title}</h2>
            <p className="mt-3 leading-relaxed text-ink/65">{t.partners.form.lead}</p>
            <div className="mt-8">
              <ApplicationForm districts={districts} />
            </div>
          </div>

          <div>
            <h2 className="text-3xl text-ink">{t.partners.uploadTitle}</h2>
            <p className="mt-3 leading-relaxed text-ink/65">{t.partners.uploadLead}</p>
            <div className="mt-8">
              <ProductUploadForm organizations={organizations} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
