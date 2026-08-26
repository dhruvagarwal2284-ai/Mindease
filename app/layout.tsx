import type { Metadata, Viewport } from "next";
import { Cinzel } from "next/font/google";
import Script from "next/script";
import { LockScreen } from "@/components/privacy";
import { Toaster } from "@/components/ui";
import { StoreProvider } from "@/lib/store";
import fs from "node:fs";
import path from "node:path";
import "./globals.css";

// Sync latest uploaded logo asset to public directories
try {
  const src =
    "C:/Users/anshu/.gemini/antigravity/brain/3853ad4b-35cf-46be-895e-266a4d1f35d4/.user_uploaded/media_1787773964767.png";
  const destDir = path.join(process.cwd(), "public", "images");
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(destDir, "mindease-logo.png"));
    fs.copyFileSync(src, path.join(process.cwd(), "public", "logo.png"));
  }
} catch {
  // fallback if already present
}

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MindEase",
  description:
    "Anonymous peer support, a private journal and consent-based counselling for campus mental health.",
};

export const viewport: Viewport = {
  themeColor: "#122135",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cinzel.variable}
      data-theme="ocean"
      data-contrast="normal"
      data-motion="full"
      data-text="normal"
    >
      <body>
        <Script id="font-preview" strategy="beforeInteractive">
          {`(function () {
            var font = new URLSearchParams(window.location.search).get("font");
            if (["modern", "editorial", "friendly"].includes(font || "")) {
              document.documentElement.dataset.font = font;
            }
          })();`}
        </Script>

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