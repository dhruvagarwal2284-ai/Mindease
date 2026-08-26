import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

// Ensure hero background illustration and logo are copied to public/images
try {
  const destDir = path.join(process.cwd(), "public", "images");
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const heroSrc =
    "C:/Users/anshu/.gemini/antigravity/brain/3853ad4b-35cf-46be-895e-266a4d1f35d4/.user_uploaded/media_1787765319171.png";
  if (fs.existsSync(heroSrc)) {
    fs.copyFileSync(heroSrc, path.join(destDir, "hero-campus-watercolor.png"));
  }

  const logoSrc =
    "C:/Users/anshu/.gemini/antigravity/brain/3853ad4b-35cf-46be-895e-266a4d1f35d4/.user_uploaded/media_1787768179019.png";
  if (fs.existsSync(logoSrc)) {
    fs.copyFileSync(logoSrc, path.join(destDir, "mindease-logo.png"));
    fs.copyFileSync(logoSrc, path.join(process.cwd(), "public", "logo.png"));
  }
} catch {
  // fallback if file already present
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
