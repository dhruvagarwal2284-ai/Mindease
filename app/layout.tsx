import type { Metadata, Viewport } from "next";
import { LockScreen } from "@/components/privacy";
import { Toaster } from "@/components/ui";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindEase Campus",
  description:
    "Anonymous peer support, a private journal and consent-based counselling for campus mental health.",
};

export const viewport: Viewport = {
  themeColor: "#122135",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-contrast="normal" data-motion="full" data-text="normal">
      <body>
        <StoreProvider>
          <a href="#main" className="skip-link">
            Skip to main content
          </a>
          {children}
          <LockScreen />
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
