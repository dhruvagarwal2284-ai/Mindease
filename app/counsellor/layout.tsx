"use client";

import { usePathname } from "next/navigation";
import { CounsellorSidebar, CounsellorTopBar, OfflineBanner } from "@/components/nav";
import { SkeletonCard } from "@/components/ui";
import { useStore } from "@/lib/store";

const TITLES: [string, string][] = [
  ["/counsellor/dashboard", "Dashboard"],
  ["/counsellor/alerts", "Support alerts"],
  ["/counsellor/cases", "Cases"],
  ["/counsellor/appointments", "Appointments"],
  ["/counsellor/moderation", "Community safety"],
  ["/counsellor/resources", "Resource library"],
  ["/counsellor/analytics", "Aggregated analytics"],
  ["/counsellor/settings", "Settings"],
];

export default function CounsellorLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useStore();
  const pathname = usePathname();
  const title = TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? "Counsellor platform";

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="no-print sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-navy-100 bg-white lg:block">
        <CounsellorSidebar />
      </aside>
      <div className="min-w-0 flex-1">
        <OfflineBanner />
        <CounsellorTopBar title={title} />
        <main id="main" className="px-4 py-5 lg:px-8 lg:py-7">
          {ready ? (
            children
          ) : (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
