import Link from "next/link";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";

const t = getDictionary();

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-gypsum/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/" aria-label={t.app.name} className="rounded-lg px-1 py-1">
          <Wordmark className="text-2xl" />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="التنقل الرئيسي">
          <Link
            href="/#meals"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink/75 transition-colors hover:bg-accent hover:text-ink sm:block"
          >
            الوجبات المتاحة
          </Link>
          <Link
            href="/#how"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink/75 transition-colors hover:bg-accent hover:text-ink md:block"
          >
            كيف تعمل؟
          </Link>
          <Link
            href="/partners"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink/75 transition-colors hover:bg-accent hover:text-ink md:block"
          >
            {t.partners.metaTitle}
          </Link>
          <Link
            href="/host/events/new"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink/75 transition-colors hover:bg-accent hover:text-ink lg:block"
          >
            فائض مناسبة
          </Link>
          <Button
            render={<Link href="/dashboard" />}
            nativeButton={false}
            className="h-10 px-4"
          >
            لوحة التحكم
          </Button>
        </nav>
      </div>
    </header>
  );
}
