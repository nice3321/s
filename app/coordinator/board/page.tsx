import { getProvider } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { Board } from "./board";

export const dynamic = "force-dynamic";

const t = getDictionary();

export const metadata = { title: `${t.board.title} — ${t.app.name}` };

/** نافذة اللوحة: من الآن حتى ٧٢ ساعة. */
const WINDOW_MS = 72 * 60 * 60 * 1000;

export default async function BoardPage() {
  const provider = getProvider();

  // نطاق الرؤية يُمرَّر كوسيط منذ الآن، فحين تصل المصادقة يصير
  // districtIds = مناطق المنسّق ولا تُلمس هذه الصفحة.
  // ⚠ لا مصادقة بعد — اللوحة مفتوحة حالياً على كل المناطق.
  const [board, districts] = await Promise.all([
    provider.listBoardEvents({ windowMs: WINDOW_MS }),
    provider.listDistricts(),
  ]);

  return (
    <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-16">
      <header className="mb-8">
        <h1 className="font-display text-3xl text-ink">{t.board.title}</h1>
        <p className="mt-2 text-base text-muted-foreground">{t.board.subtitle}</p>
      </header>

      <Board events={board.events} districts={districts} windowStart={board.windowStart} />
    </main>
  );
}
