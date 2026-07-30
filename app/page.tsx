import { CalendarClock, HandHeart, Hourglass, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Damma } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { getProvider } from "@/lib/data";
import { fmtNumber } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const t = getDictionary();

const values = [
  { Icon: CalendarClock, title: t.home.value.forecastTitle, body: t.home.value.forecastBody },
  { Icon: Hourglass, title: t.home.value.windowTitle, body: t.home.value.windowBody },
  { Icon: HandHeart, title: t.home.value.neverSoldTitle, body: t.home.value.neverSoldBody },
  { Icon: ShieldCheck, title: t.home.value.provableTitle, body: t.home.value.provableBody },
] as const;

const steps = [
  { title: t.home.step1Title, body: t.home.step1Body },
  { title: t.home.step2Title, body: t.home.step2Body },
  { title: t.home.step3Title, body: t.home.step3Body },
  { title: t.home.step4Title, body: t.home.step4Body },
  { title: t.home.step5Title, body: t.home.step5Body },
] as const;

export default async function Home() {
  const coverage = await getProvider().getCoverage();

  const coverageItems = [
    { value: coverage.districts, label: t.home.coverage.districts },
    { value: coverage.organizations, label: t.home.coverage.organizations },
    { value: coverage.teams, label: t.home.coverage.teams },
    { value: coverage.households, label: t.home.coverage.households },
  ];

  return (
    <main id="main" className="flex-1">
      {/* ── البطل ── */}
      <section className="relative overflow-hidden">
        <Damma className="pointer-events-none absolute -start-16 -top-10 size-80 rotate-12 text-saffron/8 sm:size-[28rem]" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <p className="font-mono text-sm font-semibold text-saffron">{t.footer.rights}</p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.3] font-bold text-ink sm:text-6xl sm:leading-[1.2]">
            {t.app.tagline}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink/70">{t.home.lead}</p>

          <div className="mt-10 flex flex-col gap-3 sm:max-w-lg sm:flex-row">
            <Button
              render={<Link href="/host/events/new" />}
              nativeButton={false}
              className="tap h-14 flex-1 text-lg"
            >
              {t.home.ctaHost}
            </Button>
            <Button
              render={<Link href="/coordinator/board" />}
              nativeButton={false}
              variant="outline"
              className="tap h-14 flex-1 text-lg"
            >
              {t.home.ctaCoordinator}
            </Button>
          </div>
        </div>
      </section>

      {/* ── أربع ركائز ── */}
      <section className="border-y border-border/70 bg-card/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-20">
          <h2 className="font-display text-3xl text-ink">{t.home.valueTitle}</h2>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {values.map(({ Icon, title, body }) => (
              <li key={title} className="surface lift p-7">
                <span className="flex size-12 items-center justify-center rounded-xl bg-saffron/12 text-saffron">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl leading-snug text-ink">{title}</h3>
                <p className="mt-2.5 leading-relaxed text-ink/65">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── التغطية: أرقام حيّة من القاعدة ── */}
      <section className="bg-ink text-gypsum">
        <div className="mx-auto w-full max-w-6xl px-4 py-20">
          <h2 className="font-display text-3xl">{t.home.coverageTitle}</h2>
          <p className="mt-2 text-sm text-gypsum/55">{t.home.coverageNote}</p>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {coverageItems.map((c) => (
              <div key={c.label}>
                <dt className="sr-only">{c.label}</dt>
                <dd>
                  <span className="tnum block font-mono text-5xl font-semibold text-saffron">
                    {fmtNumber(c.value)}
                  </span>
                  <span className="mt-2 block text-sm leading-snug text-gypsum/70">
                    {c.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── خمس خطوات ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <h2 className="font-display text-3xl text-ink">{t.home.howTitle}</h2>

        <ol className="mt-12 space-y-10">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-6">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-card font-mono text-lg font-semibold text-saffron shadow-sm"
                >
                  {i + 1}
                </span>
                {i < steps.length - 1 && (
                  <span aria-hidden="true" className="mt-3 w-px flex-1 bg-border" />
                )}
              </div>
              <div className="pt-2 pb-1">
                <h3 className="font-display text-xl text-ink">{s.title}</h3>
                <p className="mt-2 max-w-prose leading-relaxed text-ink/65">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── الجمهوران ── */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <h2 className="font-display text-3xl text-ink">{t.home.audienceTitle}</h2>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col rounded-2xl bg-ink p-8 text-gypsum">
            <h3 className="font-display text-2xl">{t.home.hostSideTitle}</h3>
            <p className="mt-3 flex-1 leading-relaxed text-gypsum/70">{t.home.hostSideBody}</p>
            <Button
              render={<Link href="/host/events/new" />}
              nativeButton={false}
              className="tap mt-8 h-12 self-start bg-saffron px-6 text-base font-semibold text-gypsum hover:bg-saffron/90"
            >
              {t.home.hostSideCta}
            </Button>
          </div>

          <div className="surface flex flex-col p-8">
            <h3 className="font-display text-2xl text-ink">{t.home.fieldSideTitle}</h3>
            <p className="mt-3 flex-1 leading-relaxed text-ink/65">{t.home.fieldSideBody}</p>
            <Button
              render={<Link href="/coordinator/board" />}
              nativeButton={false}
              variant="outline"
              className="tap mt-8 h-12 self-start px-6 text-base"
            >
              {t.home.fieldSideCta}
            </Button>
          </div>
        </div>
      </section>

      {/* ── دعوة ختامية ── */}
      <section className="border-t border-border/70 bg-card/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-20">
          <h2 className="max-w-2xl font-display text-3xl leading-snug text-ink sm:text-4xl">
            {t.home.closingTitle}
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/70">
            {t.home.closingBody}
          </p>

          <Button
            render={<Link href="/host/events/new" />}
            nativeButton={false}
            className="tap mt-9 h-14 px-8 text-lg"
          >
            {t.home.ctaHost}
          </Button>

          <p className="mt-14 max-w-2xl border-s-4 border-saffron ps-5 font-display text-xl leading-relaxed text-ink">
            {t.home.pledge}
          </p>
        </div>
      </section>
    </main>
  );
}
