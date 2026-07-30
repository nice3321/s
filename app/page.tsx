import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProvider } from "@/lib/data";
import { fmtNumber } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const t = getDictionary();

const values = [
  { key: "forecast", title: t.home.value.forecastTitle, body: t.home.value.forecastBody },
  { key: "window", title: t.home.value.windowTitle, body: t.home.value.windowBody },
  { key: "neverSold", title: t.home.value.neverSoldTitle, body: t.home.value.neverSoldBody },
  { key: "provable", title: t.home.value.provableTitle, body: t.home.value.provableBody },
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
      <section className="mx-auto w-full max-w-5xl px-4 pt-14 pb-16 sm:pt-24 sm:pb-20">
        <p className="font-display text-sm tracking-wide text-palm">{t.footer.rights}</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.25] text-ink sm:text-6xl sm:leading-[1.15]">
          {t.app.tagline}
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink/75">{t.home.lead}</p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:max-w-lg">
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
      </section>

      {/* ── أربع ركائز ── */}
      <section className="border-t border-border/70 bg-card/60">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <h2 className="font-display text-2xl text-palm">{t.home.valueTitle}</h2>

          <ul className="mt-9 grid gap-5 sm:grid-cols-2">
            {values.map((v) => (
              <li key={v.key} className="rounded-xl border border-border bg-gypsum p-6">
                <h3 className="font-display text-lg leading-snug text-ink">{v.title}</h3>
                <p className="mt-2.5 leading-relaxed text-ink/70">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── الجمهوران ── */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h2 className="font-display text-2xl text-palm">{t.home.audienceTitle}</h2>

        <div className="mt-9 grid gap-5 lg:grid-cols-2">
          <AudienceCard
            title={t.home.hostSideTitle}
            body={t.home.hostSideBody}
            cta={t.home.hostSideCta}
            href="/host/events/new"
          />
          <AudienceCard
            title={t.home.fieldSideTitle}
            body={t.home.fieldSideBody}
            cta={t.home.fieldSideCta}
            href="/coordinator/board"
            muted
          />
        </div>
      </section>

      {/* ── التغطية: أرقام حيّة من القاعدة ── */}
      <section className="border-y border-border/70 bg-card/60">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <h2 className="font-display text-2xl text-palm">{t.home.coverageTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.home.coverageNote}</p>

          <dl className="mt-9 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {coverageItems.map((c) => (
              <div key={c.label} className="rounded-xl border border-border bg-gypsum p-5">
                <dt className="sr-only">{c.label}</dt>
                <dd>
                  <span className="tnum block font-mono text-4xl font-semibold text-palm">
                    {fmtNumber(c.value)}
                  </span>
                  <span className="mt-1.5 block text-sm leading-snug text-muted-foreground">
                    {c.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── خمس خطوات ── */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h2 className="font-display text-2xl text-palm">{t.home.howTitle}</h2>

        <ol className="mt-10 space-y-9">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-5">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-palm/30 bg-accent font-mono text-lg font-semibold text-palm"
                >
                  {i + 1}
                </span>
                {i < steps.length - 1 && (
                  <span aria-hidden="true" className="mt-2 w-px flex-1 bg-border" />
                )}
              </div>
              <div className="pb-1 pt-1.5">
                <h3 className="font-display text-lg text-ink">{s.title}</h3>
                <p className="mt-1.5 max-w-prose leading-relaxed text-ink/70">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── دعوة ختامية ── */}
      <section className="border-t border-border/70 bg-palm text-gypsum">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <h2 className="font-display text-3xl leading-snug">{t.home.closingTitle}</h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-gypsum/85">
            {t.home.closingBody}
          </p>

          <Button
            render={<Link href="/host/events/new" />}
            nativeButton={false}
            className="tap mt-9 h-14 bg-gypsum px-8 text-lg text-palm hover:bg-gypsum/90"
          >
            {t.home.ctaHost}
          </Button>

          <p className="mt-12 border-s-4 border-saffron ps-5 font-display text-lg leading-relaxed text-gypsum/90">
            {t.home.pledge}
          </p>
        </div>
      </section>
    </main>
  );
}

function AudienceCard({
  title,
  body,
  cta,
  href,
  muted,
}: {
  title: string;
  body: string;
  cta: string;
  href: string;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-7">
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <p className="mt-3 flex-1 leading-relaxed text-ink/70">{body}</p>
      <Button
        render={<Link href={href} />}
        nativeButton={false}
        variant={muted ? "outline" : "default"}
        className="tap mt-7 h-12 self-start px-6"
      >
        {cta}
      </Button>
    </div>
  );
}
