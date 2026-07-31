"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDictionary } from "@/lib/i18n";
import { login, type LoginState } from "./actions";

const t = getDictionary();

export function LoginForm({ denied }: { denied: boolean }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {
    status: "idle",
  });

  const error =
    state.status === "error"
      ? ((t.login.error as Record<string, string>)[state.error] ?? t.login.error.generic)
      : null;

  return (
    <form action={formAction} className="surface space-y-6 p-7 sm:p-9">
      {denied && <p className="text-sm font-medium text-destructive">{t.login.denied}</p>}

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-base">
          {t.login.phone}
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          dir="ltr"
          inputMode="tel"
          autoComplete="username"
          placeholder="+964 770 123 4567"
          className="tap tnum"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-base">
          {t.login.password}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="tap"
        />
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Button type="submit" disabled={pending} className="tap h-14 w-full text-lg">
        {pending ? t.login.submitting : t.login.submit}
      </Button>
    </form>
  );
}
