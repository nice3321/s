import Link from "next/link";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";

const t = getDictionary();

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-gypsum/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label={t.app.name} className="rounded-lg px-1 py-1">
          <Wordmark className="text-2xl" />
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/coordinator/board"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink/75 transition-colors hover:bg-accent hover:text-ink"
          >
            {t.nav.board}
          </Link>
          <Button
            render={<Link href="/host/events/new" />}
            nativeButton={false}
            className="h-10 px-4"
          >
            {t.nav.newEvent}
          </Button>
        </nav>
      </div>
    </header>
  );
}
