"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Bike,
  Check,
  Clock3,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MealKind = "restaurant" | "event";
type Fulfillment = "pickup" | "delivery";

interface MealOffer {
  id: number;
  kind: MealKind;
  title: string;
  provider: string;
  district: string;
  image: string;
  imagePosition: string;
  readyAt: string;
  portions: number;
  originalPrice: number;
  price: number;
  discount?: number;
  delivery: boolean;
}

const offers: MealOffer[] = [
  {
    id: 1,
    kind: "restaurant",
    title: "دجاج مشوي مع أرز وسلطة",
    provider: "مطبخ الدار",
    district: "الرمادي — التأميم",
    image: "/brand/food-quality.png",
    imagePosition: "50% 69%",
    readyAt: "7:30 م — 9:00 م",
    portions: 6,
    originalPrice: 12000,
    price: 6000,
    discount: 50,
    delivery: true,
  },
  {
    id: 2,
    kind: "event",
    title: "وجبة قوزي من مناسبة",
    provider: "مناسبة عائلية",
    district: "الرمادي — الملعب",
    image: "/brand/dignity.png",
    imagePosition: "50% 61%",
    readyAt: "8:15 م — 9:15 م",
    portions: 12,
    originalPrice: 0,
    price: 0,
    delivery: true,
  },
  {
    id: 3,
    kind: "restaurant",
    title: "صينية كباب وخضار مشوية",
    provider: "تنور المدينة",
    district: "الفلوجة — المعلمين",
    image: "/brand/pickup-team.png",
    imagePosition: "50% 72%",
    readyAt: "9:00 م — 10:00 م",
    portions: 4,
    originalPrice: 15000,
    price: 6000,
    discount: 60,
    delivery: false,
  },
];

const currency = new Intl.NumberFormat("ar-IQ", { maximumFractionDigits: 0 });

export function MealMarketplace() {
  const [filter, setFilter] = useState<"all" | MealKind>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MealOffer | null>(null);
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");

  const visibleOffers = useMemo(() => {
    const normalized = query.trim();
    return offers.filter((offer) => {
      const matchesKind = filter === "all" || offer.kind === filter;
      const matchesQuery =
        !normalized ||
        offer.title.includes(normalized) ||
        offer.provider.includes(normalized) ||
        offer.district.includes(normalized);
      return matchesKind && matchesQuery;
    });
  }, [filter, query]);

  function openReservation(offer: MealOffer) {
    setSelected(offer);
    setFulfillment("pickup");
  }

  function confirmReservation() {
    if (!selected) return;
    toast.success("تم حجز الوجبة", {
      description:
        fulfillment === "pickup"
          ? "أظهر رمز الحجز للمطعم وادفع عند الاستلام."
          : "تم إرسال الطلب إلى شركة التوصيل المرتبطة.",
    });
    setSelected(null);
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0" aria-label="تصفية الوجبات">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
            كل الوجبات
          </FilterButton>
          <FilterButton
            active={filter === "restaurant"}
            onClick={() => setFilter("restaurant")}
          >
            خصومات المطاعم
          </FilterButton>
          <FilterButton active={filter === "event"} onClick={() => setFilter("event")}>
            فائض المناسبات المجاني
          </FilterButton>
        </div>

        <label className="relative block sm:w-72">
          <span className="sr-only">ابحث عن وجبة أو منطقة</span>
          <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن وجبة أو منطقة"
            className="h-11 pe-10"
          />
        </label>
      </div>

      {visibleOffers.length ? (
        <ul className="mt-7 grid gap-5 lg:grid-cols-3">
          {visibleOffers.map((offer) => (
            <li key={offer.id} className="surface lift group overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                <Image
                  src={offer.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  style={{ objectPosition: offer.imagePosition }}
                />
                <span
                  className={`absolute end-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${
                    offer.kind === "event"
                      ? "bg-ink text-gypsum"
                      : "bg-saffron text-white"
                  }`}
                >
                  {offer.kind === "event" ? "مجانًا من مناسبة" : `خصم ${offer.discount}%`}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg leading-snug text-ink">{offer.title}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      {offer.kind === "restaurant" ? (
                        <Store className="size-4" aria-hidden="true" />
                      ) : (
                        <Sparkles className="size-4" aria-hidden="true" />
                      )}
                      {offer.provider}
                    </p>
                  </div>
                  <Price offer={offer} />
                </div>

                <div className="mt-5 grid gap-2 text-sm text-ink/65">
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 text-saffron" aria-hidden="true" />
                    {offer.district}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 className="size-4 text-saffron" aria-hidden="true" />
                    جاهزة للاستلام: {offer.readyAt}
                  </p>
                  <p className="flex items-center gap-2">
                    <PackageCheck className="size-4 text-saffron" aria-hidden="true" />
                    متبقي {offer.portions} وجبات
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                  <Button className="tap h-11 flex-1" onClick={() => openReservation(offer)}>
                    احجز الوجبة
                  </Button>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-ink" title={offer.delivery ? "التوصيل متاح" : "استلام من المطعم"}>
                    {offer.delivery ? (
                      <Bike className="size-5" aria-hidden="true" />
                    ) : (
                      <ShoppingBag className="size-5" aria-hidden="true" />
                    )}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-7 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          لا توجد وجبات تطابق بحثك الآن.
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-title"
        >
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-saffron">تأكيد الحجز</p>
                <h3 id="reservation-title" className="mt-1 font-display text-2xl text-ink">
                  {selected.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="tap flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-ink"
                aria-label="إغلاق"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-accent p-4">
              <p className="flex items-start gap-3 text-sm leading-relaxed text-ink">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-saffron" aria-hidden="true" />
                <span>
                  <strong>أنت زبون أول.</strong> حجزك عبر سُفرة لا يغيّر جودة الوجبة أو
                  الاستقبال أو مستوى الخدمة.
                </span>
              </p>
            </div>

            <fieldset className="mt-6">
              <legend className="font-display text-sm text-ink">طريقة الاستلام</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <FulfillmentButton
                  active={fulfillment === "pickup"}
                  onClick={() => setFulfillment("pickup")}
                  icon={<ShoppingBag className="size-5" aria-hidden="true" />}
                  title="أستلم بنفسي"
                  note="الدفع للمطعم"
                />
                <FulfillmentButton
                  active={fulfillment === "delivery"}
                  onClick={() => setFulfillment("delivery")}
                  disabled={!selected.delivery}
                  icon={<Bike className="size-5" aria-hidden="true" />}
                  title="توصيل"
                  note={selected.delivery ? "عبر شركة التوصيل" : "غير متاح لهذا العرض"}
                />
              </div>
            </fieldset>

            <dl className="mt-6 space-y-3 border-y border-border py-5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">قيمة الوجبة</dt>
                <dd className="font-semibold text-ink">
                  {selected.price === 0 ? "مجانية" : `${currency.format(selected.price)} د.ع`}
                </dd>
              </div>
              {fulfillment === "delivery" && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">رسوم التوصيل التقديرية</dt>
                  <dd className="font-semibold text-ink">2,500 د.ع</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">الدفع</dt>
                <dd className="font-semibold text-ink">عند الاستلام</dd>
              </div>
            </dl>

            <Button className="tap mt-6 h-14 w-full text-base" onClick={confirmReservation}>
              <Check className="size-5" aria-hidden="true" />
              تأكيد الحجز
            </Button>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
              لا يتم سحب أي مبلغ الآن. تحتفظ المطاعم بحقها في إدارة وقت الاستلام ضمن
              الفترة المحددة.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`tap shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-ink text-gypsum" : "text-ink/65 hover:bg-secondary hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Price({ offer }: { offer: MealOffer }) {
  if (offer.price === 0) {
    return <span className="shrink-0 font-display text-lg text-saffron">مجانية</span>;
  }

  return (
    <div className="shrink-0 text-end">
      <span className="block text-xs text-muted-foreground line-through">
        {currency.format(offer.originalPrice)}
      </span>
      <span className="font-mono text-lg font-semibold text-ink">
        {currency.format(offer.price)}
        <span className="ms-1 font-sans text-xs font-normal">د.ع</span>
      </span>
    </div>
  );
}

function FulfillmentButton({
  active,
  onClick,
  disabled,
  icon,
  title,
  note,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
  note: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-2xl border p-4 text-start transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
        active ? "border-saffron bg-saffron/8" : "border-border bg-background hover:border-ink/30"
      }`}
    >
      <span className="text-saffron">{icon}</span>
      <span className="mt-3 block font-semibold text-ink">{title}</span>
      <span className="mt-1 block text-xs text-muted-foreground">{note}</span>
    </button>
  );
}
