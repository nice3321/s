import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { defaultLocale, dictionaries, dirOf } from "@/lib/i18n";
import "./globals.css";

// عرض — معماري، يُستعمل بحجم كبير وبانضباط
const notoKufi = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi",
  subsets: ["arabic"],
  display: "swap",
});

// متن وواجهة — إنساني، مقروء تحت الشمس بأحجام صغيرة
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// بيانات ومؤقتات — أرقام جدولية
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const t = dictionaries[defaultLocale];

export const metadata: Metadata = {
  title: t.app.name,
  description: t.app.tagline,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: t.app.name, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#242d52",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={defaultLocale}
      dir={dirOf(defaultLocale)}
      className={`${notoKufi.variable} ${plexArabic.variable} ${plexMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-gypsum"
        >
          {t.nav.skipToContent}
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
