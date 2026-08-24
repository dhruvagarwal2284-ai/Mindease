"use client";

import { useId, useState } from "react";
import { cx, formatDayShort, MOODS } from "@/lib/format";
import type { CheckIn } from "@/lib/types";

/**
 * Charts are plain SVG — no chart library — so every mark, label and hit area
 * is explicit and the whole thing stays keyboard- and screen-reader-legible.
 *
 * Mood is an ordinal measure with polarity, so it uses a diverging ramp:
 * two hues either side of a neutral midpoint, validated for colour-vision
 * separation. Mood is never encoded by colour alone — every mark carries its
 * emoji and label, and each chart offers a table view.
 */

export const MOOD_COLOR: Record<number, string> = {
  1: "#b42318", // Struggling
  2: "#e8850a", // Low
  3: "#7d8894", // Okay — neutral midpoint
  4: "#1cb87a", // Good
  5: "#0b7285", // Great
};

const AXIS = "#c3d5e6";
const INK_MUTED = "#3a6690";

/* ------------------------------------------------------------ Mood timeline */

export function MoodTimeline({
  checkIns,
  days = 28,
  className,
}: {
  checkIns: CheckIn[];
  days?: number;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const clipId = useId();

  const sorted = [...checkIns].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-days);

  if (sorted.length < 2) {
    return (
      <p className="muted py-6 text-center text-sm">
        Two check-ins are enough to start showing a pattern. You have{" "}
        {sorted.length === 1 ? "one" : "none"} so far.
      </p>
    );
  }

  const W = 640;
  const H = 190;
  const padL = 34;
  const padR = 14;
  const padT = 14;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const x = (i: number) => padL + (plotW * i) / Math.max(1, sorted.length - 1);
  const y = (mood: number) => padT + plotH - ((mood - 1) / 4) * plotH;

  const line = sorted.map((c, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(c.mood)}`).join(" ");
  const area = `${line} L${x(sorted.length - 1)},${padT + plotH} L${padL},${padT + plotH} Z`;

  const active = hover === null ? null : sorted[hover];

  return (
    <figure className={cx("m-0", className)}>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Your mood across your last ${sorted.length} check-ins.`}
        >
          <defs>
            <linearGradient id={clipId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d8d85" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#0d8d85" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* mood gridlines, labelled by emoji so colour is never the only cue */}
          {MOODS.map((m) => (
            <g key={m.value}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y(m.value)}
                y2={y(m.value)}
                stroke={AXIS}
                strokeWidth="1"
                strokeDasharray={m.value === 3 ? "0" : "3 4"}
                opacity={m.value === 3 ? 0.9 : 0.55}
              />
              <text
                x={padL - 10}
                y={y(m.value) + 5}
                textAnchor="end"
                fontSize="13"
                aria-hidden
              >
                {m.emoji}
              </text>
            </g>
          ))}

          <path d={area} fill={`url(#${clipId})`} />
          <path
            d={line}
            fill="none"
            stroke="#0f716c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {sorted.map((c, i) => (
            <g key={c.id}>
              <circle
                cx={x(i)}
                cy={y(c.mood)}
                r={hover === i ? 7 : 5}
                fill={MOOD_COLOR[c.mood]}
                stroke="#fff"
                strokeWidth="2"
              />
              {/* generous invisible hit target */}
              <rect
                x={x(i) - 14}
                y={padT}
                width="28"
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                role="button"
                aria-label={`${formatDayShort(c.date)}: ${
                  MOODS.find((m) => m.value === c.mood)?.label
                }${c.tags.length ? `, tagged ${c.tags.join(", ")}` : ""}`}
                className="cursor-pointer outline-none"
              />
            </g>
          ))}

          <text x={padL} y={H - 6} fontSize="11" fill={INK_MUTED}>
            {formatDayShort(sorted[0].date)}
          </text>
          <text x={W - padR} y={H - 6} fontSize="11" fill={INK_MUTED} textAnchor="end">
            {formatDayShort(sorted[sorted.length - 1].date)}
          </text>
        </svg>

        {active ? (
          <div className="pointer-events-none absolute top-2 right-2 rounded-lg border border-navy-200 bg-white/95 px-3 py-2 text-xs shadow-raised">
            <p className="font-semibold text-navy-900">{formatDayShort(active.date)}</p>
            <p className="text-navy-700">
              {MOODS.find((m) => m.value === active.mood)?.emoji}{" "}
              {MOODS.find((m) => m.value === active.mood)?.label}
            </p>
            {active.tags.length ? (
              <p className="muted mt-0.5 max-w-[12rem]">{active.tags.join(" · ")}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      <figcaption className="muted mt-1 text-center text-xs">
        Your own check-ins. This is a record of what you reported — not an assessment.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------- Weekly mood bars  */

export function WeeklyMoodBars({
  weeks,
  className,
  compact,
}: {
  weeks: { week: string; avg: number; count: number }[];
  className?: string;
  compact?: boolean;
}) {
  const withData = weeks.filter((w) => w.count > 0);
  if (!withData.length) {
    return <p className="muted text-sm">No check-ins in this window.</p>;
  }
  return (
    <div className={cx("space-y-2", className)}>
      {weeks.map((w) => {
        const pct = w.count ? ((w.avg - 1) / 4) * 100 : 0;
        const bucket = Math.max(1, Math.min(5, Math.round(w.avg)));
        return (
          <div key={w.week} className="flex items-center gap-3">
            <span
              className={cx(
                "muted shrink-0 text-xs",
                compact ? "w-12" : "w-16",
              )}
            >
              {w.week}
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-navy-100">
              {w.count ? (
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(4, pct)}%`, background: MOOD_COLOR[bucket] }}
                />
              ) : null}
            </div>
            <span className="w-20 shrink-0 text-right text-xs text-navy-700 tabular-nums">
              {w.count ? (
                <>
                  <span aria-hidden>{MOODS.find((m) => m.value === bucket)?.emoji}</span>{" "}
                  {w.avg.toFixed(1)}
                </>
              ) : (
                <span className="muted">—</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ Concern bars */

export function ConcernBars({
  rows,
  className,
  unit = "reports",
}: {
  rows: { concern: string; count: number; deltaPct?: number }[];
  className?: string;
  unit?: string;
}) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className={cx("space-y-3", className)}>
      {rows.map((r) => (
        <div key={r.concern}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium text-navy-800">{r.concern}</span>
            <span className="flex items-center gap-2">
              <span className="text-navy-900 tabular-nums">{r.count}</span>
              {typeof r.deltaPct === "number" ? (
                <span
                  className={cx(
                    "text-xs tabular-nums",
                    r.deltaPct > 0 ? "text-amber-700" : "text-mint-700",
                  )}
                >
                  {r.deltaPct > 0 ? "▲" : "▼"} {Math.abs(r.deltaPct)}%
                </span>
              ) : null}
            </span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-navy-100"
            role="img"
            aria-label={`${r.concern}: ${r.count} ${unit}`}
          >
            <div
              className="h-full rounded-full bg-navy-700"
              style={{ width: `${Math.max(3, (r.count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- Trend line */

export function TrendLine({
  points,
  label,
  className,
  color = "#0f716c",
  valueSuffix = "",
}: {
  points: { week: string; value: number }[];
  label: string;
  className?: string;
  color?: string;
  valueSuffix?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId();
  if (points.length < 2) return <p className="muted text-sm">Not enough data yet.</p>;

  const W = 620;
  const H = 180;
  const padL = 34;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...points.map((p) => p.value)) * 1.15 || 1;

  const x = (i: number) => padL + (plotW * i) / (points.length - 1);
  const y = (v: number) => padT + plotH - (v / max) * plotH;
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${padT + plotH} L${padL},${padT + plotH} Z`;
  const ticks = [0, max / 2, max];

  return (
    <figure className={cx("m-0", className)}>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${label} across ${points.length} weeks.`}
        >
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y(t)}
                y2={y(t)}
                stroke={AXIS}
                strokeWidth="1"
                opacity="0.6"
              />
              <text x={padL - 8} y={y(t) + 4} fontSize="10" fill={INK_MUTED} textAnchor="end">
                {Math.round(t)}
              </text>
            </g>
          ))}

          <path d={area} fill={`url(#${gid})`} />
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, i) => (
            <g key={p.week}>
              {hover === i ? (
                <line
                  x1={x(i)}
                  x2={x(i)}
                  y1={padT}
                  y2={padT + plotH}
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
              ) : null}
              <circle
                cx={x(i)}
                cy={y(p.value)}
                r={hover === i ? 6 : 4}
                fill={color}
                stroke="#fff"
                strokeWidth="2"
              />
              <rect
                x={x(i) - plotW / (points.length * 2)}
                y={padT}
                width={plotW / points.length}
                height={plotH}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${p.week}: ${p.value}${valueSuffix}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="cursor-pointer outline-none"
              />
              {(i === 0 || i === points.length - 1) && (
                <text
                  x={x(i)}
                  y={H - 8}
                  fontSize="10"
                  fill={INK_MUTED}
                  textAnchor={i === 0 ? "start" : "end"}
                >
                  {p.week}
                </text>
              )}
            </g>
          ))}
        </svg>

        {hover !== null ? (
          <div className="pointer-events-none absolute top-2 right-2 rounded-lg border border-navy-200 bg-white/95 px-3 py-1.5 text-xs shadow-raised">
            <span className="font-semibold text-navy-900">{points[hover].week}</span>
            <span className="muted"> · </span>
            <span className="text-navy-800 tabular-nums">
              {points[hover].value}
              {valueSuffix}
            </span>
          </div>
        ) : null}
      </div>
      <figcaption className="muted mt-1 text-xs">{label}</figcaption>
    </figure>
  );
}

/* --------------------------------------------------------------- Sparkline */

export function Sparkline({
  values,
  className,
  color = "#0f716c",
}: {
  values: number[];
  className?: string;
  color?: string;
}) {
  if (values.length < 2) return null;
  const W = 80;
  const H = 24;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const d = values
    .map((v, i) => {
      const x = (W * i) / (values.length - 1);
      const y = H - ((v - min) / span) * (H - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cx("h-6 w-20", className)} aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------- Mood distribution */

export function MoodDistribution({
  rows,
  className,
}: {
  rows: { label: string; share: number }[];
  className?: string;
}) {
  const byLabel = (l: string) => MOODS.find((m) => m.label === l);
  return (
    <div className={cx("space-y-3", className)}>
      <div
        className="flex h-6 overflow-hidden rounded-full"
        role="img"
        aria-label={rows.map((r) => `${r.label} ${r.share}%`).join(", ")}
      >
        {rows.map((r) => (
          <div
            key={r.label}
            className="h-full border-r-2 border-white last:border-r-0"
            style={{
              width: `${r.share}%`,
              background: MOOD_COLOR[byLabel(r.label)?.value ?? 3],
            }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-1.5 text-xs text-navy-700">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: MOOD_COLOR[byLabel(r.label)?.value ?? 3] }}
              aria-hidden
            />
            <span aria-hidden>{byLabel(r.label)?.emoji}</span>
            {r.label}
            <span className="muted tabular-nums">{r.share}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------- table view  */

export function DataTableView({
  head,
  rows,
}: {
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-navy-100">
          {head.map((h) => (
            <th key={h} scope="col" className="py-1.5 pr-3 font-medium text-navy-700">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-navy-50 last:border-0">
            {r.map((c, j) => (
              <td key={j} className="py-1.5 pr-3 text-navy-800 tabular-nums">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
