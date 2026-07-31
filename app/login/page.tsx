import { getDictionary } from "@/lib/i18n";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

const t = getDictionary();

export const metadata = { title: t.login.title };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;

  return (
    <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-3xl text-ink">{t.login.title}</h1>
      <p className="mt-3 leading-relaxed text-ink/65">{t.login.lead}</p>

      <div className="mt-8">
        <LoginForm denied={denied === "1"} />
      </div>
    </main>
  );
}
