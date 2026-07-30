import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic } from "next/font/google";
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
  themeColor: "#1f5c4a",
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
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
