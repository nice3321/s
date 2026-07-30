import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Tajawal } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { defaultLocale, dictionaries, dirOf } from "@/lib/i18n";
import "./globals.css";

// تجوال — خط الواجهة الوحيد: عناوين ومتن. هندسي عربي واضح على الشاشات الصغيرة.
const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
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
  title: {
    default: "سُفرة — وفر أكثر، واهدر أقل",
    template: "%s — سُفرة",
  },
  description:
    "احجز وجبات المطاعم بخصم يصل إلى 60% أو استفد من فائض المناسبات المجاني، مع استلام أو توصيل ومعاملة تليق بكل زبون.",
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
      className={`${tajawal.variable} ${plexMono.variable} h-full`}
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
