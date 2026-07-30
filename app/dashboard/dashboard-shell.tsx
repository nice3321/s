"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BadgePercent,
  Bell,
  Bike,
  CheckCircle2,
  ChevronLeft,
  CircleCheck,
  Clock3,
  LayoutDashboard,
  ListChecks,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UtensilsCrossed,
  WalletCards,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DashboardView = "overview" | "listings" | "orders" | "delivery";
type ListingKind = "sale" | "free";

interface Listing {
  id: number;
  title: string;
  kind: ListingKind;
  quantity: number;
  price: number;
  discount?: number;
  window: string;
  status: "نشط" | "قارب على الانتهاء" | "مكتمل";
  delivery: boolean;
}

const initialListings: Listing[] = [
  {
    id: 1,
    title: "دجاج مشوي مع أرز وسلطة",
    kind: "sale",
    quantity: 6,
    price: 6000,
    discount: 50,
    window: "7:30 م — 9:00 م",
    status: "نشط",
    delivery: true,
  },
  {
    id: 2,
    title: "صينية كباب وخضار",
    kind: "sale",
    quantity: 4,
    price: 6000,
    discount: 60,
    window: "9:00 م — 10:00 م",
    status: "قارب على الانتهاء",
    delivery: false,
  },
  {
    id: 3,
    title: "وجبات قوزي من مناسبة",
    kind: "free",
    quantity: 12,
    price: 0,
    window: "8:15 م — 9:15 م",
    status: "نشط",
    delivery: true,
  },
];

const orders = [
  { id: "SF-2048", customer: "أحمد محمد", item: "دجاج مشوي", method: "استلام", total: "6,000 د.ع", status: "بانتظار الوصول", time: "منذ 4 دقائق" },
  { id: "SF-2047", customer: "سارة علي", item: "وجبة قوزي", method: "توصيل", total: "مجانية + توصيل", status: "مع المندوب", time: "منذ 12 دقيقة" },
  { id: "SF-2046", customer: "عمر خالد", item: "صينية كباب", method: "استلام", total: "6,000 د.ع", status: "تم الاستلام", time: "منذ 35 دقيقة" },
] as const;

const navItems: { id: DashboardView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "listings", label: "العروض", icon: UtensilsCrossed },
  { id: "orders", label: "الحجوزات", icon: ListChecks },
  { id: "delivery", label: "التوصيل", icon: Bike },
];

const currency = new Intl.NumberFormat("ar-IQ", { maximumFractionDigits: 0 });

export function DashboardShell() {
  const [view, setView] = useState<DashboardView>("overview");
  const [showNewOffer, setShowNewOffer] = useState(false);
  const [listings, setListings] = useState(initialListings);
  const [kind, setKind] = useState<ListingKind>("sale");
  const [originalPrice, setOriginalPrice] = useState(12000);
  const [discount, setDiscount] = useState(40);

  const discountedPrice = useMemo(
    () => Math.max(0, Math.round(originalPrice * (1 - discount / 100) / 250) * 250),
    [originalPrice, discount],
  );

  function submitOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const quantity = Number(data.get("quantity") ?? 0);
    const window = String(data.get("window") ?? "").trim();
    const delivery = data.get("delivery") === "on";

    if (!title || !quantity || !window) {
      toast.error("أكمل بيانات العرض المطلوبة");
      return;
    }

    setListings((current) => [
      {
        id: Date.now(),
        title,
        kind,
        quantity,
        price: kind === "free" ? 0 : discountedPrice,
        discount: kind === "sale" ? discount : undefined,
        window,
        status: "نشط",
        delivery,
      },
      ...current,
    ]);
    setShowNewOffer(false);
    setView("listings");
    toast.success("تم نشر العرض", {
      description: kind === "free" ? "ظهر كفائض مناسبة مجاني." : "ظهر بالسعر المخفّض الجديد.",
    });
  }

  return (
    <div className="mx-auto grid w-full max-w-[1500px] lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-border bg-card lg:border-e lg:border-b-0">
        <div className="sticky top-16 p-4 lg:p-6">
          <div className="rounded-2xl bg-ink p-4 text-gypsum">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-saffron text-white">
                <Store className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-sm">مطبخ الدار</p>
                <p className="mt-1 text-xs text-gypsum/55">حساب مطعم موثّق</p>
              </div>
            </div>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col" aria-label="أقسام لوحة التحكم">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-current={view === id ? "page" : undefined}
                className={`tap flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors lg:w-full ${
                  view === id
                    ? "bg-accent text-ink"
                    : "text-ink/60 hover:bg-secondary hover:text-ink"
                }`}
              >
                <Icon className={`size-5 ${view === id ? "text-saffron" : ""}`} aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-6 hidden rounded-2xl border border-saffron/25 bg-saffron/7 p-4 lg:block">
            <ShieldCheck className="size-5 text-saffron" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-ink">معيار الزبون الأول</p>
            <p className="mt-2 text-xs leading-5 text-ink/60">
              كل حجز من سُفرة يُخدم بالمستوى نفسه داخل المطعم.
            </p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 bg-background">
        <header className="flex flex-col gap-5 border-b border-border bg-card/80 px-4 py-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="text-sm text-muted-foreground">مساء الخير، محمد</p>
            <h1 className="mt-1 font-display text-2xl text-ink">إدارة سُفرتك اليوم</h1>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="tap flex size-11 items-center justify-center rounded-xl border border-border bg-card text-ink/60 hover:text-ink" aria-label="الإشعارات">
              <Bell className="size-5" aria-hidden="true" />
            </button>
            <Button className="tap h-11 px-5" onClick={() => setShowNewOffer(true)}>
              <Plus className="size-5" aria-hidden="true" />
              عرض جديد
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {view === "overview" && <Overview listings={listings} onNew={() => setShowNewOffer(true)} />}
          {view === "listings" && <Listings listings={listings} onNew={() => setShowNewOffer(true)} />}
          {view === "orders" && <Orders />}
          {view === "delivery" && <Delivery />}
        </div>
      </div>

      {showNewOffer && (
        <NewOfferPanel
          kind={kind}
          setKind={setKind}
          originalPrice={originalPrice}
          setOriginalPrice={setOriginalPrice}
          discount={discount}
          setDiscount={setDiscount}
          discountedPrice={discountedPrice}
          onClose={() => setShowNewOffer(false)}
          onSubmit={submitOffer}
        />
      )}
    </div>
  );
}

function Overview({ listings, onNew }: { listings: Listing[]; onNew: () => void }) {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-saffron">أداء اليوم</p>
            <h2 className="mt-1 font-display text-2xl text-ink">نظرة سريعة</h2>
          </div>
          <p className="hidden text-sm text-muted-foreground sm:block">آخر تحديث: قبل دقيقة</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={ShoppingBag} label="حجوزات اليوم" value="18" note="+5 عن الأمس" accent />
          <Stat icon={WalletCards} label="قيمة المبيعات" value="84,000" unit="د.ع" note="دفع عند الاستلام" />
          <Stat icon={PackageCheck} label="وجبات تم إنقاذها" value="31" note="بين مخفّضة ومجانية" />
          <Stat icon={Bike} label="طلبات التوصيل" value="7" note="3 في الطريق" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section className="surface overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border p-5">
            <div>
              <h2 className="font-display text-xl text-ink">آخر الحجوزات</h2>
              <p className="mt-1 text-sm text-muted-foreground">تابع الاستلام والتوصيل لحظة بلحظة</p>
            </div>
            <button type="button" className="text-sm font-semibold text-ink hover:text-saffron">
              عرض الكل
            </button>
          </div>
          <OrderRows compact />
        </section>

        <section className="overflow-hidden rounded-3xl bg-ink p-6 text-gypsum">
          <ShieldCheck className="size-8 text-saffron" aria-hidden="true" />
          <h2 className="mt-6 font-display text-2xl leading-snug">كل عميل هو زبون أول</h2>
          <p className="mt-4 leading-7 text-gypsum/65">
            لا تغيّر التغليف أو نقطة الاستلام أو أسلوب الخدمة بسبب الخصم. هذا هو وعد سُفرة
            الذي يراه العميل قبل أن يحجز.
          </p>
          <div className="mt-7 rounded-2xl border border-gypsum/15 bg-gypsum/6 p-4">
            <p className="flex items-center gap-2 text-sm">
              <CircleCheck className="size-5 text-saffron" aria-hidden="true" />
              التزام الحساب مفعّل
            </p>
          </div>
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl text-ink">العروض النشطة</h2>
          <Button variant="outline" className="tap h-10" onClick={onNew}>
            <Plus className="size-4" aria-hidden="true" />
            إضافة عرض
          </Button>
        </div>
        <ListingGrid listings={listings.slice(0, 3)} />
      </section>
    </div>
  );
}

function Listings({ listings, onNew }: { listings: Listing[]; onNew: () => void }) {
  const [query, setQuery] = useState("");
  const visible = listings.filter((listing) => listing.title.includes(query.trim()));

  return (
    <section>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-saffron">إدارة المخزون اليومي</p>
          <h2 className="mt-1 font-display text-2xl text-ink">العروض</h2>
        </div>
        <Button className="tap h-11 px-5" onClick={onNew}>
          <Plus className="size-5" aria-hidden="true" />
          عرض جديد
        </Button>
      </div>

      <label className="relative mt-6 block max-w-md">
        <span className="sr-only">ابحث في العروض</span>
        <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في العروض" className="h-11 pe-10" />
      </label>

      <ListingGrid listings={visible} />
    </section>
  );
}

function ListingGrid({ listings }: { listings: Listing[] }) {
  return (
    <ul className="mt-5 grid gap-4 xl:grid-cols-3">
      {listings.map((listing) => (
        <li key={listing.id} className="surface p-5">
          <div className="flex items-start justify-between gap-3">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${listing.kind === "free" ? "bg-ink text-gypsum" : "bg-saffron/10 text-saffron"}`}>
              {listing.kind === "free" ? "مجانًا من مناسبة" : `خصم ${listing.discount}%`}
            </span>
            <span className={`flex items-center gap-1.5 text-xs font-semibold ${listing.status === "قارب على الانتهاء" ? "text-clay" : "text-ink/55"}`}>
              <span className={`size-2 rounded-full ${listing.status === "قارب على الانتهاء" ? "bg-clay" : "bg-emerald-500"}`} />
              {listing.status}
            </span>
          </div>
          <h3 className="mt-5 font-display text-lg leading-snug text-ink">{listing.title}</h3>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">السعر الحالي</p>
              <p className="mt-1 font-mono text-xl font-semibold text-ink">
                {listing.price === 0 ? "مجانية" : `${currency.format(listing.price)} د.ع`}
              </p>
            </div>
            <div className="text-end">
              <p className="text-xs text-muted-foreground">المتبقي</p>
              <p className="mt-1 font-mono text-xl font-semibold text-ink">{listing.quantity}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock3 className="size-4 text-saffron" aria-hidden="true" />{listing.window}</span>
            {listing.delivery && <Bike className="size-4 text-saffron" aria-label="التوصيل متاح" />}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Orders() {
  return (
    <section>
      <p className="text-sm font-semibold text-saffron">الطلبات المباشرة</p>
      <h2 className="mt-1 font-display text-2xl text-ink">الحجوزات</h2>
      <p className="mt-2 text-sm text-muted-foreground">العميل يدفع عند الاستلام من المطعم أو من مندوب التوصيل.</p>
      <div className="surface mt-6 overflow-hidden">
        <OrderRows />
      </div>
    </section>
  );
}

function OrderRows({ compact = false }: { compact?: boolean }) {
  const rows = compact ? orders.slice(0, 3) : orders;
  return (
    <ul className="divide-y divide-border">
      {rows.map((order) => (
        <li key={order.id} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-ink">
              {order.method === "توصيل" ? <Bike className="size-5" aria-hidden="true" /> : <ShoppingBag className="size-5" aria-hidden="true" />}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-ink">{order.customer} <span className="font-mono text-xs font-normal text-muted-foreground">#{order.id}</span></p>
              <p className="mt-1 truncate text-sm text-muted-foreground">{order.item} · {order.method} · {order.time}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-5 sm:justify-end">
            <div className="text-end">
              <p className="text-sm font-semibold text-ink">{order.total}</p>
              <p className="mt-1 text-xs text-muted-foreground">{order.status}</p>
            </div>
            <button type="button" className="tap flex size-10 items-center justify-center rounded-xl border border-border text-ink/55 hover:text-ink" aria-label={`تفاصيل الطلب ${order.id}`}>
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Delivery() {
  return (
    <section>
      <p className="text-sm font-semibold text-saffron">ربط شركة التوصيل</p>
      <h2 className="mt-1 font-display text-2xl text-ink">التوصيل</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        فعّل التوصيل للعروض المناسبة، وتابع قبول الشركة للطلب ووقت وصول المندوب.
      </p>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="surface p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-ink text-gypsum">
                <Truck className="size-7" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-lg text-ink">شركة التوصيل المرتبطة</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-emerald-700"><CircleCheck className="size-4" aria-hidden="true" />الاتصال فعّال</p>
              </div>
            </div>
            <Button variant="outline" className="tap h-10">إدارة الربط</Button>
          </div>

          <dl className="mt-7 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
            <DeliveryStat label="طلبات اليوم" value="7" />
            <DeliveryStat label="متوسط القبول" value="2:40 د" />
            <DeliveryStat label="في الطريق الآن" value="3" />
          </dl>
        </div>

        <div className="surface p-6">
          <h3 className="font-display text-lg text-ink">قواعد التوصيل</h3>
          <div className="mt-5 space-y-4 text-sm">
            <Rule label="السماح بالتوصيل تلقائيًا" enabled />
            <Rule label="إيقاف الطلب قبل إغلاق المطبخ بـ 15 دقيقة" enabled />
            <Rule label="إرسال الطلب لأكثر من شركة" enabled={false} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value, unit, note, accent }: { icon: typeof LayoutDashboard; label: string; value: string; unit?: string; note: string; accent?: boolean }) {
  return (
    <div className="surface p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={`flex size-10 items-center justify-center rounded-xl ${accent ? "bg-saffron text-white" : "bg-accent text-ink"}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="text-xs text-muted-foreground">اليوم</span>
      </div>
      <p className="mt-5 font-mono text-3xl font-semibold text-ink">{value}{unit && <span className="ms-1 font-sans text-sm font-normal text-ink/60">{unit}</span>}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{label}</p>
      <p className="mt-2 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function DeliveryStat({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-mono text-2xl font-semibold text-ink">{value}</dd></div>;
}

function Rule({ label, enabled }: { label: string; enabled: boolean }) {
  const [active, setActive] = useState(enabled);
  return (
    <button type="button" onClick={() => setActive((current) => !current)} className="flex w-full items-center justify-between gap-4 rounded-xl bg-secondary/55 p-3 text-start">
      <span className="text-ink/75">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${active ? "bg-saffron" : "bg-ink/15"}`} aria-label={active ? "مفعّل" : "متوقف"}>
        <span className={`absolute top-1 size-4 rounded-full bg-white shadow transition-all ${active ? "end-1" : "end-6"}`} />
      </span>
    </button>
  );
}

function NewOfferPanel({ kind, setKind, originalPrice, setOriginalPrice, discount, setDiscount, discountedPrice, onClose, onSubmit }: {
  kind: ListingKind;
  setKind: (kind: ListingKind) => void;
  originalPrice: number;
  setOriginalPrice: (value: number) => void;
  discount: number;
  setDiscount: (value: number) => void;
  discountedPrice: number;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/45 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="new-offer-title">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-card p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-saffron">نشر مباشر</p>
            <h2 id="new-offer-title" className="mt-1 font-display text-2xl text-ink">عرض وجبة جديد</h2>
          </div>
          <button type="button" onClick={onClose} className="tap flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-ink" aria-label="إغلاق">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-7 space-y-6">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">مصدر الوجبة</legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <TypeButton active={kind === "sale"} onClick={() => setKind("sale")} icon={<Store className="size-5" aria-hidden="true" />} title="عرض مطعم" note="بسعر مخفّض" />
              <TypeButton active={kind === "free"} onClick={() => setKind("free")} icon={<UtensilsCrossed className="size-5" aria-hidden="true" />} title="فائض مناسبة" note="مجاني دائمًا" />
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="offer-title" className="text-sm font-semibold">اسم الوجبة</Label>
            <Input id="offer-title" name="title" required placeholder="مثال: دجاج مشوي مع أرز وسلطة" className="h-12" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="offer-quantity" className="text-sm font-semibold">عدد الوجبات</Label>
              <Input id="offer-quantity" name="quantity" type="number" min="1" required defaultValue="6" className="h-12 tnum" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-window" className="text-sm font-semibold">فترة الاستلام</Label>
              <Input id="offer-window" name="window" required defaultValue="8:00 م — 9:30 م" className="h-12" />
            </div>
          </div>

          {kind === "sale" ? (
            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="original-price" className="text-sm font-semibold">السعر الأصلي</Label>
                  <Input id="original-price" type="number" min="1000" step="250" value={originalPrice} onChange={(event) => setOriginalPrice(Number(event.target.value))} className="h-12 tnum" />
                </div>
                <div>
                  <Label htmlFor="discount" className="text-sm font-semibold">نسبة الخصم: {discount}%</Label>
                  <input id="discount" type="range" min="10" max="60" step="5" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} className="mt-4 w-full accent-[var(--saffron)]" />
                  <p className="mt-1 text-xs text-muted-foreground">الحد الأعلى المسموح 60%</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-accent p-4">
                <span className="text-sm text-muted-foreground">السعر الذي سيدفعه الزبون</span>
                <span className="font-mono text-xl font-semibold text-ink">{currency.format(discountedPrice)} د.ع</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-ink/15 bg-accent p-5">
              <p className="flex items-start gap-3 text-sm leading-7 text-ink">
                <BadgePercent className="mt-1 size-5 shrink-0 text-saffron" aria-hidden="true" />
                فائض المناسبات يظهر مجانًا دائمًا. لا يمكن إدخال سعر أو خصم لهذا النوع من العروض.
              </p>
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-4">
            <input type="checkbox" name="delivery" className="mt-1 size-5 accent-[var(--saffron)]" />
            <span><strong className="block text-sm text-ink">إتاحة التوصيل</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">يُرسل الحجز إلى شركة التوصيل المرتبطة بعد تأكيده.</span></span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-saffron/25 bg-saffron/7 p-4">
            <input type="checkbox" required className="mt-1 size-5 accent-[var(--saffron)]" />
            <span><strong className="block text-sm text-ink">أتعهد بمعاملة كل حاجز كزبون أول</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">نفس جودة الوجبة والتغليف ونقطة الاستلام وأسلوب الخدمة، بصرف النظر عن السعر.</span></span>
          </label>

          <Button type="submit" className="tap h-14 w-full text-base">
            <CheckCircle2 className="size-5" aria-hidden="true" />
            نشر العرض الآن
          </Button>
        </form>
      </div>
    </div>
  );
}

function TypeButton({ active, onClick, icon, title, note }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; note: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-2xl border p-4 text-start transition-colors ${active ? "border-saffron bg-saffron/8" : "border-border hover:border-ink/25"}`}>
      <span className="text-saffron">{icon}</span>
      <span className="mt-3 block font-semibold text-ink">{title}</span>
      <span className="mt-1 block text-xs text-muted-foreground">{note}</span>
    </button>
  );
}
