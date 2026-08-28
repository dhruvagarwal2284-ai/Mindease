import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

// Ensure hero background illustration and feature images are copied to public/images
try {
  const destDir = path.join(process.cwd(), "public", "images");
  const featDir = path.join(destDir, "features");
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(featDir)) fs.mkdirSync(featDir, { recursive: true });

  const uploads = [
    {
      src: "C:/Users/anshu/.gemini/antigravity/brain/3853ad4b-35cf-46be-895e-266a4d1f35d4/.user_uploaded/media_1787917028392.jpg",
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
