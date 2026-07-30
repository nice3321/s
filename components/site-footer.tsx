import Link from "next/link";
import { Wordmark } from "@/components/logo";
import { getDictionary } from "@/lib/i18n";

const t = getDictionary();

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-gypsum">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-14 sm:flex-row sm:items-start sm:justify-between lg:px-8">
        <div>
          <Wordmark className="text-3xl text-gypsum" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-gypsum/60">
            طعام جيد يأخذ فرصته، وزبون يُعامل دائمًا بالاحترام نفسه.
          </p>
        </div>

        <nav className="flex flex-col gap-3 text-sm">
          <Link href="/" className="text-gypsum/75 transition-colors hover:text-gypsum">
            {t.nav.home}
          </Link>
          <Link
            href="/#meals"
            className="text-gypsum/75 transition-colors hover:text-gypsum"
          >
            الوجبات المتاحة
          </Link>
          <Link
            href="/host/events/new"
            className="text-gypsum/75 transition-colors hover:text-gypsum"
          >
            سجّل فائض مناسبة
          </Link>
          <Link
            href="/partners"
            className="text-gypsum/75 transition-colors hover:text-gypsum"
          >
            {t.partners.metaTitle}
          </Link>
          <Link
            href="/dashboard"
            className="text-gypsum/75 transition-colors hover:text-gypsum"
          >
            لوحة التحكم
          </Link>
          <Link
            href="/coordinator/board"
            className="text-gypsum/75 transition-colors hover:text-gypsum"
          >
            {t.nav.board}
          </Link>
        </nav>
      </div>

      <div className="border-t border-gypsum/15">
        <p className="mx-auto w-full max-w-7xl px-4 py-5 text-xs text-gypsum/50 lg:px-8">
          سُفرة — طعام فائض يصل بكرامة، قبل أن يبرد.
        </p>
      </div>
    </footer>
  );
}
