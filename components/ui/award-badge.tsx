"use client";

import React, { MouseEvent, useEffect, useRef, useState } from "react";

/**
 * A holographic award badge that tilts toward the cursor.
 *
 * The tilt-plus-foil technique is adapted from the Product Hunt badge; the
 * artwork, wording and palette are MindEase's own — reproducing another
 * company's badge and wordmark would be passing off their award as ours.
 *
 * Awards are the aspirational half of the leaderboard. A rank number tells you
 * where you sit; a badge is a thing you keep. See `lib/leaderboard.ts` for what
 * actually earns one — it is gratitude received, never volume of activity.
 */

export type AwardKind =
  | "top-supporter"
  | "most-thanked"
  | "steady-presence"
  | "first-response";

interface AwardBadgeProps {
  kind: AwardKind;
  /** 1, 2 or 3 — drives the gold / silver / bronze foil. */
  place?: number;
  /** e.g. "This week". Rendered small above the title. */
  period?: string;
  href?: string;
  className?: string;
}

const IDENTITY_MATRIX = "1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1";

const MAX_ROTATE = 0.25;
const MIN_ROTATE = -0.25;
const MAX_SCALE = 1;
const MIN_SCALE = 0.97;

/** gold, silver, bronze — index is `place - 1`. */
const FOIL = ["#f3e3ac", "#e3e6e8", "#f1cfa6"];

const TITLE: Record<AwardKind, string> = {
  "top-supporter": "Top Supporter",
  "most-thanked": "Most Thanked",
  "steady-presence": "Steady Presence",
  "first-response": "First to Respond",
};

/** Hue stops for the foil sweep. `null` renders a transparent layer, which
 *  breaks up the spectrum so it reads as foil rather than a rainbow. */
const SHEEN: (string | null)[] = [
  "hsl(168, 70%, 55%)",
  "hsl(190, 80%, 60%)",
  "hsl(45, 95%, 62%)",
  "hsl(140, 60%, 58%)",
  "hsl(225, 75%, 62%)",
  "hsl(270, 60%, 62%)",
  "hsl(300, 30%, 50%)",
  null,
  null,
  "white",
];

/** The app has its own motion switch on <html> as well as the OS one. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () =>
      setReduced(mq.matches || document.documentElement.dataset.motion === "reduced");
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  return reduced;
}

export const AwardBadge = ({ kind, place, period, href, className }: AwardBadgeProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [sheenAngle, setSheenAngle] = useState(0);
  const [matrix, setMatrix] = useState(IDENTITY_MATRIX);
  const [currentMatrix, setCurrentMatrix] = useState(IDENTITY_MATRIX);
  const [snapOverlay, setSnapOverlay] = useState(true);
  const [holdIdleSweep, setHoldIdleSweep] = useState(false);
  const [settled, setSettled] = useState(false);

  const enterTimeout = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeouts = useRef<NodeJS.Timeout[]>([]);
  const reduced = usePrefersReducedMotion();

  const dimensions = () => {
    const r = ref.current?.getBoundingClientRect();
    return { left: r?.left ?? 0, right: r?.right ?? 0, top: r?.top ?? 0, bottom: r?.bottom ?? 0 };
  };

  const matrixFor = (clientX: number, clientY: number) => {
    const { left, right, top, bottom } = dimensions();
    const xc = (left + right) / 2;
    const yc = (top + bottom) / 2;

    const scale = [
      MAX_SCALE - ((MAX_SCALE - MIN_SCALE) * Math.abs(xc - clientX)) / (xc - left),
      MAX_SCALE - ((MAX_SCALE - MIN_SCALE) * Math.abs(yc - clientY)) / (yc - top),
      MAX_SCALE -
        ((MAX_SCALE - MIN_SCALE) * (Math.abs(xc - clientX) + Math.abs(yc - clientY))) /
          (xc - left + yc - top),
    ];

    const x1 = 0.25 * ((yc - clientY) / yc - (xc - clientX) / xc);
    const x2 = MAX_ROTATE - ((MAX_ROTATE - MIN_ROTATE) * Math.abs(right - clientX)) / (right - left);
    const y2 = MAX_ROTATE - ((MAX_ROTATE - MIN_ROTATE) * (top - clientY)) / (top - bottom);
    const z0 = -(MAX_ROTATE - ((MAX_ROTATE - MIN_ROTATE) * Math.abs(right - clientX)) / (right - left));
    const z1 = 0.2 - (0.8 * (top - clientY)) / (top - bottom);

    return (
      `${scale[0]}, 0, ${z0}, 0, ` +
      `${x1}, ${scale[1]}, ${z1}, 0, ` +
      `${x2}, ${y2}, ${scale[2]}, 0, ` +
      `0, 0, 0, 1`
    );
  };

  /** A softened mirror of `m`, used to ease in on enter and out on leave. */
  const oppositeMatrix = (m: string, clientY: number, entering = false) => {
    const { top, bottom } = dimensions();
    const mirroredY = bottom - clientY + top;
    const damping = entering ? 0.7 : 4;
    const sign = entering ? -1 : 1;
    const tilt = MAX_ROTATE - ((MAX_ROTATE - MIN_ROTATE) * (top - mirroredY)) / (top - bottom);

    return m
      .split(", ")
      .map((item, i) => {
        if (i === 2 || i === 4 || i === 8) return String((-parseFloat(item) * sign) / damping);
        if (i === 0 || i === 5 || i === 10) return "1";
        if (i === 6) return String((sign * tilt) / damping);
        if (i === 9) return String(tilt / damping);
        return item;
      })
      .join(", ");
  };

  const sweepFor = (clientX: number, clientY: number) => {
    const { left, right, top, bottom } = dimensions();
    return (Math.abs((left + right) / 2 - clientX) + Math.abs((top + bottom) / 2 - clientY)) / 1.5;
  };

  const onMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    leaveTimeouts.current.forEach(clearTimeout);
    leaveTimeouts.current = [];
    setHoldIdleSweep(true);
    setSnapOverlay(false);
    enterTimeout.current = setTimeout(() => setSnapOverlay(true), 350);

    // Two frames so the transition has a start value to animate from.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setSheenAngle(sweepFor(e.clientX, e.clientY))),
    );

    setMatrix(oppositeMatrix(matrixFor(e.clientX, e.clientY), e.clientY, true));
    setSettled(false);
    setTimeout(() => setSettled(true), 200);
  };

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    setTimeout(() => setSheenAngle(sweepFor(e.clientX, e.clientY)), 150);
    if (settled) setCurrentMatrix(matrixFor(e.clientX, e.clientY));
  };

  const onMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    if (enterTimeout.current) clearTimeout(enterTimeout.current);

    setCurrentMatrix(oppositeMatrix(matrix, e.clientY));
    setTimeout(() => setCurrentMatrix(IDENTITY_MATRIX), 200);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setSnapOverlay(false);
        leaveTimeouts.current = [
          setTimeout(() => setSheenAngle((a) => -a / 4), 150),
          setTimeout(() => setSheenAngle(0), 300),
          setTimeout(() => {
            setHoldIdleSweep(false);
            setSnapOverlay(true);
          }, 500),
        ];
      }),
    );
  };

  useEffect(() => {
    if (settled) setMatrix(currentMatrix);
  }, [currentMatrix, settled]);

  useEffect(
    () => () => {
      if (enterTimeout.current) clearTimeout(enterTimeout.current);
      leaveTimeouts.current.forEach(clearTimeout);
    },
    [],
  );

  const idleSweep = SHEEN.map(
    (_, i) => `@keyframes me-foil-${i} {
      0%,100% { transform: rotate(${i * 10}deg); }
      50% { transform: rotate(${(i + 1) * 10}deg); }
    }`,
  ).join("\n");

  const badge = (
    <div
      ref={ref}
      className={`block h-auto w-[220px] sm:w-[260px] ${href ? "cursor-pointer" : ""} ${className ?? ""}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      <style>{idleSweep}</style>
      <div
        style={{
          transform: `perspective(700px) matrix3d(${matrix})`,
          transformOrigin: "center center",
          transition: "transform 200ms ease-out",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 54" className="h-auto w-full">
          <defs>
            <filter id="me-badge-blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>
            <mask id="me-badge-mask">
              <rect width="260" height="54" rx="10" fill="white" />
            </mask>
          </defs>

          <rect width="260" height="54" rx="10" fill={FOIL[(place ?? 2) - 1] ?? FOIL[1]} />
          <rect
            x="4"
            y="4"
            width="252"
            height="46"
            rx="8"
            fill="transparent"
            stroke="#bbb"
            strokeWidth="1"
          />

          <text fontSize="8.5" fontWeight="bold" fill="#5c5c5c" x="52" y="20" letterSpacing="0.8">
            MINDEASE CAMPUS{period ? ` · ${period.toUpperCase()}` : ""}
          </text>
          <text fontSize="15" fontWeight="bold" fill="#4a4a4a" x="51" y="40">
            {TITLE[kind]}
            {place ? ` #${place}` : ""}
          </text>

          {/* Care mark — a heart with a sprout, drawn rather than imported so it
              stays monochrome against the foil. */}
          <g transform="translate(12, 13)" fill="#5c5c5c">
            <path d="M14 27c-5-2.6-8.6-6.9-8.6-11.3 0-2.8 2-4.8 4.5-4.8 1.9 0 3.4 1 4.1 2.5.7-1.5 2.2-2.5 4.1-2.5 2.5 0 4.5 2 4.5 4.8C22.6 20.1 19 24.4 14 27z" />
            <path d="M14 11.4c-.3-3 .7-5.6 2.9-7.4.5 2.9-.4 5.5-2.9 7.4z" />
            <path d="M13.4 11.3C12.2 8.9 10.2 7.4 7.5 7c1.1 2.7 3 4.3 5.9 4.3z" />
          </g>

          <g style={{ mixBlendMode: "overlay" }} mask="url(#me-badge-mask)">
            {SHEEN.map((fill, i) => (
              <g
                key={i}
                style={{
                  transform: `rotate(${sheenAngle + i * 10}deg)`,
                  transformOrigin: "center center",
                  transition: snapOverlay ? "none" : "transform 200ms ease-out",
                  animation: holdIdleSweep || reduced ? "none" : `me-foil-${i} 5s infinite`,
                  willChange: "transform",
                }}
              >
                <polygon
                  points="0,0 260,54 260,0 0,54"
                  fill={fill ?? "transparent"}
                  filter="url(#me-badge-blur)"
                  opacity="0.5"
                />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );

  return href ? <a href={href}>{badge}</a> : badge;
};
