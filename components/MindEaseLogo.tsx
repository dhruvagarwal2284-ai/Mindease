"use client";

import Link from "next/link";
import React from "react";

/**
 * Precision vector lotus blossom emblem matching the MindEase brand geometry.
 * Clean, transparent, and scalable with cyan-to-royal gradients and center silhouette.
 */
export function MindEaseLotusMark({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
      aria-hidden="true"
    >
      <defs>
        {/* Core Royal Center Gradient */}
        <linearGradient id="lotus-royal" x1="50" y1="10" x2="50" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="70%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>

        {/* Cyan Wing Accent Gradient */}
        <linearGradient id="lotus-cyan" x1="15" y1="25" x2="85" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Soft Blue Outer Petals */}
        <linearGradient id="lotus-outer" x1="50" y1="40" x2="50" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      {/* Far Left Petal */}
      <path
        d="M10 55C20 44 38 42 48 50C38 60 24 66 10 55Z"
        fill="url(#lotus-cyan)"
        opacity="0.9"
      />

      {/* Far Right Petal */}
      <path
        d="M90 55C80 44 62 42 52 50C62 60 76 66 90 55Z"
        fill="url(#lotus-cyan)"
        opacity="0.9"
      />

      {/* Upper Left Wing */}
      <path
        d="M22 35C33 28 47 34 50 52C38 52 27 45 22 35Z"
        fill="url(#lotus-cyan)"
      />

      {/* Upper Right Wing */}
      <path
        d="M78 35C67 28 53 34 50 52C62 52 73 45 78 35Z"
        fill="url(#lotus-cyan)"
      />

      {/* Mid Left Petal */}
      <path
        d="M28 50C36 40 47 46 50 60C40 62 31 58 28 50Z"
        fill="url(#lotus-outer)"
      />

      {/* Mid Right Petal */}
      <path
        d="M72 50C64 40 53 46 50 60C60 62 69 58 72 50Z"
        fill="url(#lotus-outer)"
      />

      {/* Bottom Base Arch Left */}
      <path
        d="M18 64C30 64 42 68 50 76C36 76 24 72 18 64Z"
        fill="#0369a1"
      />

      {/* Bottom Base Arch Right */}
      <path
        d="M82 64C70 64 58 68 50 76C64 76 76 72 82 64Z"
        fill="#0369a1"
      />

      {/* Central Flame / Petal Arch */}
      <path
        d="M50 8C42 22 39 44 50 70C61 44 58 22 50 8Z"
        fill="url(#lotus-royal)"
      />

      {/* Center Figure Head */}
      <circle cx="50" cy="38" r="4.5" fill="#082f49" />

      {/* Center Figure Torso */}
      <path
        d="M45 52C45 46 55 46 55 52C55 64 45 64 45 52Z"
        fill="#082f49"
      />
    </svg>
  );
}

export function MindEaseLogo({
  size = "md",
  title = "MindEase Campus",
  subtitle = "Student Wellbeing",
  showText = true,
  variant = "dark",
  className = "",
  href = "/",
}: {
  size?: "sm" | "md" | "lg";
  title?: string;
  subtitle?: string;
  showText?: boolean;
  variant?: "dark" | "light";
  className?: string;
  href?: string;
}) {
  const isLight = variant === "light";

  const dimensions =
    size === "sm"
      ? {
          badge: "h-8 w-8 p-1 rounded-lg",
          icon: "w-5 h-5",
          title: "text-base",
          sub: "text-[9px] tracking-wider",
        }
      : size === "lg"
        ? {
            badge: "h-12 w-12 p-2 rounded-2xl",
            icon: "w-8 h-8",
            title: "text-2xl",
            sub: "text-xs tracking-widest",
          }
        : {
            // Default "md"
            badge: "h-10 w-10 p-1.5 rounded-xl",
            icon: "w-6 h-6",
            title: "text-lg sm:text-xl",
            sub: "text-[10px] sm:text-[11px] tracking-wider",
          };

  const content = (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* Soft rounded container with calm teal backdrop and generous internal breathing room */}
      <div
        className={`flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105 ${
          dimensions.badge
        } ${
          isLight
            ? "bg-slate-800/90 border border-slate-700/80"
            : "bg-teal-50/90 border border-teal-200/80"
        }`}
      >
        <MindEaseLotusMark className={dimensions.icon} />
      </div>

      {showText ? (
        <div className="flex flex-col justify-center text-left">
          <span
            className={`font-serif font-bold tracking-tight leading-tight ${dimensions.title} ${
              isLight ? "text-white" : "text-navy-900"
            }`}
            style={{ fontFamily: 'var(--font-cinzel), Cinzel, "Cormorant Garamond", Georgia, serif' }}
          >
            {title}
          </span>
          {subtitle ? (
            <span
              className={`font-semibold uppercase leading-tight mt-0.5 ${dimensions.sub} ${
                isLight ? "text-teal-400" : "text-teal-800"
              }`}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}
