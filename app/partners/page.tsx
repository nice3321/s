import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Recycle,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
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
const trust = [t.partners.trustOne, t.partners.trustTwo, t.partners.trustThree];
const weAsk = [t.partners.weAskOne, t.partners.weAskTwo, t.partners.weAskThree];
const weGive = [t.partners.weGiveOne, t.partners.weGiveTwo, t.partners.weGiveThree];

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
      {/* ── البطل: نص وصورة، كما في الرئيسية ── */}
      <section className="relative isolate">
        <Damma className="pointer-events-none absolute -start-28 top-4 -z-10 size-[30rem] rotate-12 text-saffron/8" />

        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pt-16 pb-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pt-24 lg:pb-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-saffron/25 bg-saffron/8 px-4 py-2 text-sm font-semibold text-saffron">
              <BadgeCheck className="size-4" aria-hidden="true" />
              {t.partners.eyebrow}
            </p>

            <h1 className="mt-7 max-w-2xl text-4xl leading-[1.3] text-ink sm:text-5xl sm:leading-[1.25]">
              {t.partners.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">{t.partners.lead}</p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                render={<a href="#apply" />}
                nativeButton={false}
                className="tap h-14 px-8 text-lg"
              >
                {t.partners.cta}
                <ArrowLeft className="size-5" aria-hidden="true" />
              </Button>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink/65">
              {trust.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-saffron" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* الصورة مقتصّة على الشريط المصوَّر — إعلانات الحملة تحمل نصّها المطبوع */}
          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-saffron/8 blur-2xl" />
            <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-card p-2 shadow-[0_35px_90px_-35px_rgba(36,45,82,.35)]">
              {/* إطار عريض عمداً: الإعلان ٤:٥ وعنوانه في أعلاه، فكلما اتّسع
                  الإطار ضاق الشريط المرئي وأمكن حصره في الصورة وحدها. */}
              <div className="relative aspect-[3/2] overflow-hidden rounded-[1.55rem] bg-secondary">
                <Image
                  src="/brand/surplus-not-waste.png"
                  alt="وجبات فائضة معبّأة بعناية على منضدة مطبخ"
                  fill
                  priority
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: "50% 78%" }}
                />
              </div>
            </div>

            <div className="absolute -end-2 top-8 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:-end-8">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Wallet className="size-4 text-saffron" aria-hidden="true" />
                {t.partners.heroBadgeOne}
              </p>
            </div>

            <div className="absolute -bottom-5 -start-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:-start-8">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Clock3 className="size-4 text-saffron" aria-hidden="true" />
                {t.partners.heroBadgeTwo}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── أرقام حيّة: بطاقة كحلية تجسر القسمين بدل شريط سادّ ── */}
      <section className="mx-auto w-full max-w-7xl px-4 lg:px-8">
        <div className="rounded-[2rem] bg-ink px-6 py-12 text-gypsum sm:px-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl">{t.partners.statsTitle}</h2>
            <p className="text-sm text-gypsum/55">{t.partners.statsNote}</p>
          </div>

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

      {/* ── المنافع: صورة كبيرة يقابلها صفّ مكثّف بدل أربع بطاقات فضفاضة ── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 lg:px-8 lg:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-[.85fr_1.15fr]">
          {/* عريضة على الجوال (وإلا صارت ٨٢٥px من الفراغ)، وأطول على الشاشة الواسعة.
              كلا النسبتين أعرض من نسبة الإعلان ٤:٥ فيبقى المرئي منه صورةً بلا نصّه. */}
          <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem] bg-muted lg:sticky lg:top-24 lg:aspect-[4/3]">
            <Image
              src="/brand/donor-sources.png"
              alt="طاهٍ يجهّز عبوات الفائض في مطبخ مطعم"
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
              style={{ objectPosition: "50% 68%" }}
            />
          </div>

          <div>
            <h2 className="text-3xl text-ink sm:text-4xl">{t.partners.whyTitle}</h2>

            <ul className="mt-10 divide-y divide-border">
              {benefits.map(({ Icon, title, body }) => (
                <li key={title} className="flex gap-5 py-7 first:pt-0">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-saffron/12 text-saffron">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-xl leading-snug text-ink">{title}</h3>
                    <p className="mt-2 leading-relaxed text-ink/65">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── الخطوات ── */}
      <section className="border-y border-border bg-card/60">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
          <h2 className="text-3xl text-ink sm:text-4xl">{t.partners.stepsTitle}</h2>
          <p className="mt-3 max-w-xl leading-7 text-ink/65">{t.partners.stepsLead}</p>

          <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
            <ol className="space-y-8">
              {steps.map((step, i) => (
                <li key={step} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <span
                      aria-hidden="true"
                      className="flex size-12 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-gypsum font-mono text-lg font-semibold text-saffron"
                    >
                      {i + 1}
                    </span>
                    {i < steps.length - 1 && (
                      <span aria-hidden="true" className="mt-2 h-10 w-px bg-border" />
                    )}
                  </div>
                  <p className="pt-3 text-lg leading-relaxed text-ink/75">{step}</p>
                </li>
              ))}
            </ol>

            <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem] bg-muted lg:aspect-[4/3]">
              <Image
                src="/brand/register-surplus.png"
                alt="شاشة تسجيل الفائض في تطبيق سُفرة"
                fill
                sizes="(min-width: 1024px) 32vw, 100vw"
                className="object-cover"
                style={{ objectPosition: "50% 66%" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── الاتفاق: عمودان صريحان ── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
        <h2 className="text-3xl text-ink sm:text-4xl">{t.partners.pactTitle}</h2>
        <p className="mt-3 max-w-xl leading-7 text-ink/65">{t.partners.pactLead}</p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="surface p-8">
            <h3 className="text-sm font-semibold text-saffron">{t.partners.weAsk}</h3>
            <ul className="mt-5 space-y-4">
              {weAsk.map((item) => (
                <li key={item} className="flex gap-3 text-lg leading-relaxed text-ink/80">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-saffron" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-ink p-8 text-gypsum">
            <h3 className="text-sm font-semibold text-saffron">{t.partners.weGive}</h3>
            <ul className="mt-5 space-y-4">
              {weGive.map((item) => (
                <li key={item} className="flex gap-3 text-lg leading-relaxed text-gypsum/85">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-saffron" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── معرض الشركاء: يظهر فقط حين توجد صور، فلا مساحة ميتة ── */}
      {products.length > 0 && (
        <section className="border-y border-border bg-card/60">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
            <h2 className="text-3xl text-ink">{t.partners.galleryTitle}</h2>

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
          </div>
        </section>
      )}

      {/* ── الطلب: عمود واحد مركّز على خلفية كحلية ── */}
      <section id="apply" className="scroll-mt-20 bg-ink">
        <div className="mx-auto w-full max-w-3xl px-4 py-20 lg:px-8">
          <div className="text-center text-gypsum">
            <h2 className="text-3xl sm:text-4xl">{t.partners.form.title}</h2>
            <p className="mt-3 leading-relaxed text-gypsum/70">{t.partners.form.lead}</p>
          </div>

          <div className="mt-10">
            <ApplicationForm districts={districts} />
          </div>
        </div>
      </section>

      {/* ── الرفع: أداة شركاء، لا مادة تسويقية — لذلك ثانوية وبعد الطلب ── */}
      <section className="mx-auto w-full max-w-3xl px-4 py-20 lg:px-8">
        <p className="text-sm font-semibold text-saffron">{t.partners.partnersOnly}</p>
        <h2 className="mt-2 text-2xl text-ink">{t.partners.uploadTitle}</h2>
        <p className="mt-3 leading-relaxed text-ink/65">{t.partners.uploadLead}</p>

        <div className="mt-8">
          <ProductUploadForm organizations={organizations} />
        </div>
      </section>
    </main>
  );
}
