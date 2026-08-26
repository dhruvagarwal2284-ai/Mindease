"use client";

import Link from "next/link";
import React from "react";
import { Cormorant_Garamond } from "next/font/google";

const mindEaseFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

/**
 * MindEase logo image
 */
export function MindEaseLotusMark({
  className = "w-6 h-6",
}: {
  className?: string;
}) {
  return (
    <img
      src="/logo.png"
      alt="MindEase logo"
      className={`${className} shrink-0 object-contain scale-[2.2]`}
    />
  );
}

export function MindEaseLogo({
  size = "md",
  title = "MindEase",
  subtitle = "",
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
            badge: "h-10 w-10 p-1.5 rounded-xl",
            icon: "w-6 h-6",
            title: "text-lg sm:text-xl",
            sub: "text-[10px] sm:text-[11px] tracking-wider",
          };

  const content = (
    <div
      className={`inline-flex items-center gap-3 group select-none ${className}`}
    >
      {/* MindEase PNG Logo */}
      <div
        className={`flex items-center justify-center shrink-0 overflow-hidden shadow-2xs transition-transform duration-200 group-hover:scale-105 ${
          dimensions.badge
        } ${
          isLight
            ? "bg-slate-800/90 border border-slate-700/80"
            : "bg-teal-50/90 border border-teal-200/80"
        }`}
      >
        <MindEaseLotusMark className={dimensions.icon} />
      </div>

      {/* MindEase Text */}
      {showText ? (
        <div className="flex flex-col justify-center text-left">
          <span
            className={`${mindEaseFont.className} font-bold tracking-tight leading-tight ${
              dimensions.title
            } ${
              isLight ? "text-white" : "text-navy-900"
            }`}
          >
            {title}
          </span>

          {subtitle ? (
            <span
              className={`font-semibold uppercase leading-tight mt-0.5 ${
                dimensions.sub
              } ${
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