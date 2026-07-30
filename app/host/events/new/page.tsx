import { getProvider } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { EventForm } from "./event-form";

export const dynamic = "force-dynamic";

const t = getDictionary();

export const metadata = { title: `${t.newEvent.title} — ${t.app.name}` };

export default async function NewEventPage() {
  const provider = getProvider();
  const [districts, organizations] = await Promise.all([
    provider.listDistricts(),
    provider.listOrganizations(),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 pb-16">
      <header className="mb-8">
        <h1 className="font-display text-3xl leading-tight text-ink">{t.newEvent.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {t.newEvent.intro}
        </p>
      </header>

      <EventForm districts={districts} organizations={organizations} />
    </main>
  );
}
