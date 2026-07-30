import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

const t = getDictionary();

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-gypsum">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-lg text-palm">{t.app.name}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">{t.footer.rights}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/60">{t.footer.dignity}</p>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/" className="text-ink/75 hover:text-palm">
            {t.nav.home}
          </Link>
          <Link href="/coordinator/board" className="text-ink/75 hover:text-palm">
            {t.nav.board}
          </Link>
          <Link href="/host/events/new" className="text-ink/75 hover:text-palm">
            {t.nav.newEvent}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
