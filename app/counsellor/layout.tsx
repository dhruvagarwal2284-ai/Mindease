"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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

  // 🔥 Added state to control mobile sidebar visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close the mobile menu automatically when the route (pathname) changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh lg:flex">
      
      {/* ---------------------------------------------------- */}
      {/* 1. DESKTOP SIDEBAR (Visible only on large screens)   */}
      {/* ---------------------------------------------------- */}
      <aside className="no-print sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-navy-100 bg-white lg:block">
        <CounsellorSidebar />
      </aside>

      {/* ---------------------------------------------------- */}
      {/* 2. MOBILE SIDEBAR (Slide-in overlay for small screens)*/}
      {/* ---------------------------------------------------- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop (Dark overlay) */}
          <div 
            className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Slide-in Menu Panel */}
          <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl animate-in slide-in-from-left-8 duration-300 flex flex-col">
            <CounsellorSidebar />
          </aside>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. MAIN CONTENT AREA                                 */}
      {/* ---------------------------------------------------- */}
      <div className="min-w-0 flex-1">
        <OfflineBanner />
        
        {/* Pass the toggle function to the TopBar so the hamburger button works */}
        <CounsellorTopBar 
          title={title} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        
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