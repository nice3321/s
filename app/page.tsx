import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";

const t = getDictionary();

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-16">
      <h1 className="font-display text-5xl text-palm">{t.app.name}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink">{t.app.tagline}</p>

      <Button
        render={<Link href="/host/events/new" />}
        nativeButton={false}
        className="tap mt-10 h-14 w-full text-lg"
      >
        {t.newEvent.title}
      </Button>
    </main>
  );
}
