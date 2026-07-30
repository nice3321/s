import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

const t = getDictionary();

const links = [
  { href: "/coordinator/board", label: t.nav.board },
  { href: "/host/events/new", label: t.nav.newEvent },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-gypsum/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-xl text-palm"
          aria-label={t.app.name}
        >
          <Vessel />
          {t.app.name}
        </Link>

        <nav className="flex flex-1 items-center justify-end gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-accent hover:text-palm"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

/** قِدر التقديم — نفس الشكل الذي يبنى عليه مؤقّت الساعتين في شاشات الميدان. */
function Vessel() {
  return (
    <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
      <path
        d="M6 14h20v3a10 10 0 0 1-10 10A10 10 0 0 1 6 17v-3z"
        fill="currentColor"
      />
      <rect x="4" y="11" width="24" height="3" rx="1.5" fill="#e0a32e" />
      <path
        d="M13 8c0-2 2-2 2-4M19 8c0-2 2-2 2-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}
