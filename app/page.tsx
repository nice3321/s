import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgePercent,
  Bike,
  CalendarHeart,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Leaf,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Utensils,
  Wallet,
} from "lucide-react";
import { Damma } from "@/components/logo";
import { MealMarketplace } from "@/components/meal-marketplace";
import { Button } from "@/components/ui/button";
import { getProvider } from "@/lib/data";
import { fmtNumber } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";

const t = getDictionary();

const principles = [
  "نفس جودة الوجبة",
  "نفس الاستقبال والخدمة",
  "لا طابور منفصل ولا معاملة أقل",
] as const;

const steps = [
  {
    icon: MapPin,
    number: "01",
    title: "اختر ما يناسبك",
    body: "تصفّح عروض المطاعم المخفّضة أو الوجبات المجانية القادمة من المناسبات القريبة.",
  },
  {
    icon: ShoppingBag,
    number: "02",
    title: "احجز قبل انتهاء الوقت",
    body: "نحفظ وجبتك باسمك ونرسل للمطعم أو الجهة إشعارًا واضحًا بموعد الاستلام.",
  },
  {
    icon: Bike,
    number: "03",
    title: "استلم أو اطلب التوصيل",
    body: "ادفع السعر المخفّض عند المطعم، أو اختر التوصيل عندما يكون متاحًا عبر الشركة المرتبطة.",
  },
] as const;

export const dynamic = "force-dynamic";

export default async function Home() {
  // أرقام التغطية من القاعدة لا ثوابت مكتوبة — الوعد في القسم نفسه أنها حيّة.
  const coverage = await getProvider().getCoverage();

  const coverageItems = [
    { value: coverage.districts, label: t.home.coverage.districts },
    { value: coverage.organizations, label: t.home.coverage.organizations },
    { value: coverage.teams, label: t.home.coverage.teams },
    { value: coverage.households, label: t.home.coverage.households },
  ];

  return (
    <main id="main" className="flex-1 overflow-hidden">
      <section className="relative isolate">
        <div className="hero-grid pointer-events-none absolute inset-0 -z-20" />
        <Damma className="pointer-events-none absolute -start-24 top-12 -z-10 size-[30rem] rotate-12 text-saffron/8" />

        <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center gap-12 px-4 py-14 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-saffron/25 bg-saffron/8 px-4 py-2 text-sm font-semibold text-saffron">
              <Sparkles className="size-4" aria-hidden="true" />
              من الفائض إلى سُفرة
            </p>
            <h1 className="mt-7 font-display text-4xl leading-[1.35] font-bold text-ink sm:text-6xl sm:leading-[1.25]">
              وجبة ممتازة.
              <br />
              <span className="text-saffron">سعر أذكى.</span> ونفس معاملة الزبون الأول.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/70 sm:text-xl">
              مطاعم تعرض وجبات لم تُبع بخصم يصل إلى 60%، وأصحاب مناسبات يقدّمون فائضهم
              مجانًا. تحجز عبر سُفرة، ثم تستلم باحترام ومن دون أي فرق في الخدمة.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                render={<Link href="#meals" />}
                nativeButton={false}
                className="tap h-14 px-7 text-base"
              >
                تصفّح الوجبات المتاحة
                <ArrowLeft className="size-5" aria-hidden="true" />
              </Button>
              <Button
                render={<Link href="/dashboard" />}
                nativeButton={false}
                variant="outline"
                className="tap h-14 border-ink/20 bg-card/70 px-7 text-base backdrop-blur"
              >
                <Store className="size-5" aria-hidden="true" />
                اعرض وجباتك
              </Button>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-sm text-ink/65">
              {principles.map((principle) => (
                <li key={principle} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-saffron" aria-hidden="true" />
                  {principle}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-saffron/8 blur-2xl" />
            <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-card p-2 shadow-[0_35px_90px_-35px_rgba(36,45,82,.35)]">
              <div className="relative aspect-[1.03] overflow-hidden rounded-[1.55rem] bg-secondary">
                <Image
                  src="/brand/food-quality.png"
                  alt="تجهيز وجبة طازجة بعناية داخل مطبخ نظيف"
                  fill
                  priority
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: "50% 66%" }}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/50 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white">
                  <div>
                    <p className="text-sm text-white/75">جاهزة للاستلام حتى 9:00 م</p>
                    <p className="mt-1 font-display text-xl">دجاج مشوي مع أرز وسلطة</p>
                  </div>
                  <span className="rounded-xl bg-saffron px-3 py-2 font-mono text-sm font-semibold">
                    -50%
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -end-2 -top-5 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:-end-8 sm:top-12">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <BadgePercent className="size-4 text-saffron" aria-hidden="true" />
                قيمة الوجبة
              </p>
              <p className="mt-1 font-mono text-xl font-semibold text-ink">6,000 د.ع</p>
            </div>

            <div className="absolute -bottom-6 -start-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:-start-8 sm:bottom-10">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Clock3 className="size-4 text-saffron" aria-hidden="true" />
                احجز الآن، وادفع عند الاستلام
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/65">
        <div className="mx-auto grid w-full max-w-7xl gap-px bg-border px-4 py-16 md:grid-cols-2 lg:px-8">
          <article className="bg-card p-7 sm:p-10">
            {/* إعلانات الحملة ٤:٥ وفيها عنوان مطبوع أعلى وزرّ مطبوع أسفل.
                نقتصّ الشريط المصوَّر بينهما فلا يزاحم نصّها نصّ البطاقة،
                ولا يظهر زرّ غير قابل للنقر. */}
            <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
              <Image
                src="/brand/donor-sources.png"
                alt="طهاة ومطابخ تجهّز فائض الطعام في عبوات مرتّبة"
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
                style={{ objectPosition: "50% 67%" }}
              />
            </div>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-saffron/10 text-saffron">
              <Store className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-6 text-sm font-semibold text-saffron">للمطاعم والمخابز والمقاهي</p>
            <h2 className="mt-2 font-display text-3xl leading-snug text-ink">
              بع ما تبقّى بخصم يصل إلى 60%
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-ink/65">
              حدّد الكمية والسعر ووقت الجاهزية. الزبون يحجز عبر سُفرة ويدفع لك مباشرة عند
              الاستلام، من دون تعقيد دورة الدفع.
            </p>
            <Link href="/dashboard" className="mt-7 inline-flex items-center gap-2 font-semibold text-ink hover:text-saffron">
              افتح لوحة المطعم
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </article>

          <article className="bg-card p-7 sm:p-10">
            <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
              <Image
                src="/brand/register-surplus.png"
                alt="تسجيل فائض المناسبة عبر تطبيق سُفرة بخطوات بسيطة"
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
                style={{ objectPosition: "50% 58%" }}
              />
            </div>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-ink/8 text-ink">
              <CalendarHeart className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-6 text-sm font-semibold text-saffron">لأصحاب المناسبات والقاعات</p>
            <h2 className="mt-2 font-display text-3xl leading-snug text-ink">
              قدّم فائض المناسبة مجانًا وبترتيب واضح
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-ink/65">
              الطعام الصالح من المناسبات لا يُباع. يُسجّل مجانًا، وتُنظّم عملية الحجز
              والاستلام والتوصيل بما يحفظ الجودة والخصوصية.
            </p>
            <Link href="/host/events/new" className="mt-7 inline-flex items-center gap-2 font-semibold text-ink hover:text-saffron">
              سجّل فائض مناسبة
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>

      <section id="meals" className="scroll-mt-24 mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-saffron">متاح الآن</p>
            <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">وجبات قريبة منك</h2>
          </div>
          <p className="max-w-xl leading-7 text-ink/60">
            كل عرض يبيّن مصدره وسعره ووقت استلامه بوضوح. المجاني يبقى مجانيًا، والمخفّض
            يُدفع مباشرة عند الاستلام.
          </p>
        </div>

        <div className="mt-9">
          <MealMarketplace />
        </div>
      </section>

      <section id="how" className="scroll-mt-24 relative overflow-hidden bg-ink text-gypsum">
        <div className="route-orbit pointer-events-none absolute -start-40 top-1/2 size-[38rem] -translate-y-1/2 rounded-full border border-saffron/25" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
          <p className="text-sm font-semibold text-saffron">من الحجز إلى الوجبة</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">ثلاث خطوات بلا تعقيد</h2>

          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map(({ icon: Icon, number, title, body }) => (
              <li key={number} className="rounded-3xl border border-gypsum/15 bg-gypsum/6 p-7 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-saffron text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm text-gypsum/35">{number}</span>
                </div>
                <h3 className="mt-7 font-display text-xl">{title}</h3>
                <p className="mt-3 leading-7 text-gypsum/65">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:px-8">
        <div className="relative min-h-[480px] overflow-hidden rounded-[2rem] bg-secondary">
          <Image
            src="/brand/dignity.png"
            alt="تسليم حقيبة طعام باحترام بين شخصين"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            style={{ objectPosition: "50% 62%" }}
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-saffron">وعد المعاملة الواحدة</p>
          <h2 className="mt-3 font-display text-3xl leading-snug text-ink sm:text-4xl">
            لسنا نبيع «بقايا».
            <br />
            نحن نفتح طريقًا جديدًا لوجبة جيدة.
          </h2>
          <p className="mt-6 text-lg leading-8 text-ink/65">
            من يطلب عبر سُفرة ليس زبونًا من درجة ثانية. المطعم يقدّم له الوجبة نفسها، من
            الباب نفسه، وبالاحترام نفسه. السعر يتغيّر لأن وقت البيع قصير، لا لأن قيمة
            الإنسان أقل.
          </p>

          <ul className="mt-8 space-y-4">
            <PromiseItem icon={Utensils} title="جودة لا تتغيّر" body="وجبة كاملة محفوظة ومغلّفة كما يجب." />
            <PromiseItem icon={ShieldCheck} title="خصوصية واحترام" body="لا وصف محرج ولا معاملة مختلفة عند الاستلام." />
            <PromiseItem icon={HeartHandshake} title="اتفاق واضح مع الشركاء" body="نشر العرض مشروط بالتزام المطعم بمعيار الخدمة نفسه." />
          </ul>
        </div>
      </section>

      <section className="border-y border-border bg-card/70">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold text-saffron">استلام أو توصيل</p>
            <h2 className="mt-2 font-display text-3xl leading-snug text-ink sm:text-4xl">
              اختر الطريقة التي تناسبك
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-ink/65">
              احجز الوجبة وتوجّه إلى المطعم للدفع بالسعر المخفّض، أو اطلب التوصيل عندما
              يكون المطعم مرتبطًا بشركة توصيل. حالة الطلب تبقى واضحة للطرفين.
            </p>
            <Button
              render={<Link href="#meals" />}
              nativeButton={false}
              className="tap mt-8 h-12 px-6"
            >
              ابدأ الحجز
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface p-7">
              <ShoppingBag className="size-7 text-saffron" aria-hidden="true" />
              <h3 className="mt-5 font-display text-xl text-ink">استلام من المطعم</h3>
              <p className="mt-3 leading-7 text-ink/60">
                رمز حجز واضح، فترة استلام محددة، والدفع مباشرة للمطعم عند الوصول.
              </p>
            </div>
            <div className="surface p-7">
              <Bike className="size-7 text-saffron" aria-hidden="true" />
              <h3 className="mt-5 font-display text-xl text-ink">توصيل عبر شريك</h3>
              <p className="mt-3 leading-7 text-ink/60">
                ربط الطلب بشركة التوصيل مع إظهار الرسوم والحالة ووقت الوصول المتوقع.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* سُفرة لكل الناس — الطلب ليس دليل حاجة، بل موقف من الهدر */}
      <section className="border-y border-border bg-card/60">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
          <p className="text-sm font-semibold text-saffron">{t.everyone.eyebrow}</p>
          <h2 className="mt-2 max-w-3xl text-3xl leading-snug text-ink sm:text-4xl">
            {t.everyone.title}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">{t.everyone.lead}</p>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            <div className="surface p-7">
              <span className="flex size-12 items-center justify-center rounded-xl bg-saffron/12 text-saffron">
                <Wallet className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl text-ink">{t.everyone.benefitOneTitle}</h3>
              <p className="mt-2.5 leading-relaxed text-ink/65">{t.everyone.benefitOneBody}</p>
            </div>

            <div className="surface p-7">
              <span className="flex size-12 items-center justify-center rounded-xl bg-saffron/12 text-saffron">
                <Leaf className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl text-ink">{t.everyone.benefitTwoTitle}</h3>
              <p className="mt-2.5 leading-relaxed text-ink/65">{t.everyone.benefitTwoBody}</p>
            </div>

            {/* الخصلة: القيمة التي تجعل الطلب موقفاً لا حاجة — تُبرز بالكحلي */}
            <div className="flex flex-col rounded-2xl bg-ink p-7 text-gypsum">
              <span className="flex size-12 items-center justify-center rounded-xl bg-saffron/20 text-saffron">
                <Sparkles className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl">{t.everyone.nobleTitle}</h3>
              <p className="mt-2.5 flex-1 leading-relaxed text-gypsum/75">{t.everyone.nobleBody}</p>
              <Button
                render={<Link href="#meals" />}
                nativeButton={false}
                className="tap mt-7 h-12 self-start bg-saffron px-6 text-base font-semibold text-gypsum hover:bg-saffron/90"
              >
                {t.everyone.cta}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* التغطية — أرقام حيّة من القاعدة، ولوحة المنسّق التشغيلية */}
      <section className="border-y border-border bg-ink text-gypsum">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-saffron">{t.home.coverageNote}</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">{t.home.coverageTitle}</h2>
            </div>
            <Link
              href="/coordinator/board"
              className="inline-flex items-center gap-2 font-semibold text-gypsum/80 transition-colors hover:text-saffron"
            >
              {t.nav.board}
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>

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

      <section className="mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-saffron p-8 text-white sm:p-12">
          <Damma className="pointer-events-none absolute -bottom-28 -start-20 size-80 rotate-12 text-white/12" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-white/75">للمطاعم وأصحاب المناسبات</p>
              <h2 className="mt-2 max-w-2xl font-display text-3xl leading-snug sm:text-4xl">
                وجبتك لم تُبع؟ امنحها وقتًا إضافيًا ووجهة واضحة.
              </h2>
            </div>
            <Button
              render={<Link href="/dashboard" />}
              nativeButton={false}
              className="tap h-14 shrink-0 bg-ink px-7 text-base text-gypsum hover:bg-ink/90"
            >
              افتح لوحة التحكم
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function PromiseItem({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-saffron/10 text-saffron">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <h3 className="font-display text-base text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-ink/60">{body}</p>
      </div>
    </li>
  );
}
