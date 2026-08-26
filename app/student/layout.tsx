"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { OfflineBanner, StudentBottomNav, StudentSidebar, StudentTopBar } from "@/components/nav";
import { SkeletonCard } from "@/components/ui";
import { useStore } from "@/lib/store";

/**
 * Routes reachable without completing onboarding. Someone who opens MindEase in
 * a bad moment must not have to finish a six-step signup flow before they can
 * reach the help screen.
 */
const OPEN_ROUTES = ["/student/help"];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { ready, state } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const isOpenRoute = OPEN_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    if (ready && !state.onboarded && !isOpenRoute) router.replace("/onboarding");
  }, [ready, state.onboarded, isOpenRoute, router]);

  if (!ready || (!state.onboarded && !isOpenRoute)) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-16">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="no-print sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-navy-100 bg-white lg:block">
        <StudentSidebar />
      </aside>
      <div className="min-w-0 flex-1">
        <OfflineBanner />
        <StudentTopBar />
        <main id="main" className="mx-auto max-w-3xl px-4 pt-4 pb-28 lg:max-w-4xl lg:px-8 lg:py-7 lg:pb-12">
          {children}
        </main>
        <StudentBottomNav />
      </div>
    </div>
  );
}
