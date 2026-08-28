import type { Metadata, Viewport } from "next";
import { Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { LockScreen } from "@/components/privacy";
import { Toaster } from "@/components/ui";
import { StoreProvider } from "@/lib/store";
import fs from "node:fs";
import path from "node:path";
import "./globals.css";

// Sync uploaded hero background and feature illustrations
try {
  const destDir = path.join(process.cwd(), "public", "images");
  const featDir = path.join(destDir, "features");
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(featDir)) fs.mkdirSync(featDir, { recursive: true });

  const uploads = [
    {
      src: "C:/Users/anshu/.gemini/antigravity/brain/3853ad4b-35cf-46be-895e-266a4d1f35d4/.user_uploaded/media_1787856684334.jpg",
      dest: path.join(destDir, "hero-campus.jpg"),
    },
    {
      src: "C:/Users/anshu/.gemini/antigravity/brain/3853ad4b-35cf-46be-895e-266a4d1f35d4/.user_uploaded/media_1787857199887.png",
      dest: path.join(featDir, "peer-chat.png"),
    },
    {
      src: "C:/Users/anshu/.gemini/antigravity/brain/3853ad4b-35cf-46be-895e-266a4d1f35d4/.user_uploaded/media_1787857199912.png",
      dest: path.join(featDir, "journal.png"),
    },
    {
      src: "C:/Users/anshu/.gemini/antigravity/brain/3853ad4b-35cf-46be-895e-266a4d1f35d4/.user_uploaded/media_1787857199991.png",
      dest: path.join(featDir, "resources.png"),
    },
    {
      src: "C:/Users/anshu/.gemini/antigravity/brain/3853ad4b-35cf-46be-895e-266a4d1f35d4/.user_uploaded/media_1787857199872.png",
      dest: path.join(featDir, "counselling.png"),
    },
    {
      src: "C:/Users/anshu/.gemini/antigravity/brain/3853ad4b-35cf-46be-895e-266a4d1f35d4/.user_uploaded/media_1787773964767.png",
      dest: path.join(destDir, "mindease-logo.png"),
    },
  ];

  for (const item of uploads) {
    if (fs.existsSync(item.src)) {
      fs.copyFileSync(item.src, item.dest);
    }
  }
} catch {
  // fallback if already present
}

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

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
      className={`${plusJakarta.variable} ${cinzel.variable}`}
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