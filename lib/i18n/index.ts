import { ar } from "./ar";
import { en } from "./en";

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

/** يوسّع الحرفيات إلى string حتى تحمل القواميس نفس الشكل بنصوص مختلفة. */
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof ar>;

export const dictionaries: Record<Locale, Dictionary> = { ar, en };

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getDictionary(locale: Locale = defaultLocale): Dictionary {
  return dictionaries[locale];
}
