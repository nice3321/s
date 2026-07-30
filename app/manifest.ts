import type { MetadataRoute } from "next";
import { defaultLocale, dictionaries, dirOf } from "@/lib/i18n";

const t = dictionaries[defaultLocale];

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: t.app.name,
    short_name: t.app.name,
    description: t.app.tagline,
    lang: defaultLocale,
    dir: dirOf(defaultLocale),
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#242d52",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
