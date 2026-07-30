import type { Metadata } from "next";
import { DashboardShell } from "./dashboard-shell";

export const metadata: Metadata = {
  title: "لوحة التحكم",
  description: "إدارة عروض الوجبات والحجوزات والتوصيل في سُفرة.",
};

export default function DashboardPage() {
  return (
    <main id="main" className="flex-1">
      <DashboardShell />
    </main>
  );
}
