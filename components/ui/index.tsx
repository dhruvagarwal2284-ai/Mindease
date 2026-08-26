"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cx } from "@/lib/format";

/* ---------------------------------------------------------------- Button */

type ButtonTone = "primary" | "secondary" | "ghost" | "urgent" | "support" | "pro";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_TONES: Record<ButtonTone, string> = {
  primary:
    "bg-teal-700 text-white hover:bg-teal-800 border border-teal-700 shadow-sm disabled:bg-teal-700/50",
  secondary:
    "bg-white text-navy-800 border border-navy-200 hover:bg-navy-50 hover:border-navy-300",
  ghost: "bg-transparent text-navy-700 border border-transparent hover:bg-navy-100/70",
  urgent: "bg-urgent-600 text-white border border-urgent-600 hover:bg-urgent-700 shadow-sm",
  support: "bg-mint-600 text-white border border-mint-600 hover:bg-mint-700 shadow-sm",
  pro: "bg-pro-700 text-white border border-pro-700 hover:bg-pro-800 shadow-sm",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm gap-1.5",
  md: "min-h-11 px-4 text-[0.95rem] gap-2",
  lg: "min-h-13 px-5 text-base gap-2",
};

export function Button({
  tone = "secondary",
  size = "md",
  full,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
  size?: ButtonSize;
  full?: boolean;
}) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        BUTTON_TONES[tone],
        BUTTON_SIZES[size],
        full && "w-full",
        className,
      )}
    />
  );
}

export function LinkButton({
  href,
  tone = "secondary",
  size = "md",
  full,
  className,
  children,
  ...rest
}: React.ComponentProps<typeof Link> & {
  tone?: ButtonTone;
  size?: ButtonSize;
  full?: boolean;
}) {
  return (
    <Link
      href={href}
      {...rest}
      className={cx(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors",
        BUTTON_TONES[tone],
        BUTTON_SIZES[size],
        full && "w-full",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ Card */

export function Card({
  className,
  as: As = "div",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { as?: React.ElementType }) {
  return <As {...rest} className={cx("card p-4 sm:p-5", className)} />;
}

export function SectionTitle({
  title,
  action,
  subtitle,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mb-3 flex items-end justify-between gap-3", className)}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-navy-900">{title}</h2>
        {subtitle ? <p className="muted mt-0.5 text-sm">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------ Badge/Chip */

type BadgeTone =
  | "navy"
  | "teal"
  | "mint"
  | "info"
  | "amber"
  | "urgent"
  | "pro"
  | "neutral";

const BADGE_TONES: Record<BadgeTone, string> = {
  navy: "bg-navy-100 text-navy-800 border-navy-200",
  teal: "bg-teal-50 text-teal-800 border-teal-200",
  mint: "bg-mint-50 text-mint-800 border-mint-200",
  info: "bg-info-50 text-info-800 border-info-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  urgent: "bg-urgent-50 text-urgent-800 border-urgent-200",
  pro: "bg-pro-50 text-pro-800 border-pro-200",
  neutral: "bg-navy-50 text-navy-600 border-navy-100",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  icon,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        BADGE_TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function Chip({
  selected,
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...rest}
      className={cx(
        "min-h-9 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "border-teal-700 bg-teal-700 text-white"
          : "border-navy-200 bg-white text-navy-700 hover:border-navy-300 hover:bg-navy-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------ Empty/Skel */

export function EmptyState({
  icon = "🌱",
  title,
  body,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "card flex flex-col items-center gap-2 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="text-3xl" aria-hidden>
        {icon}
      </div>
      <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      {body ? <p className="muted max-w-sm text-sm">{body}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cx("animate-pulse-soft rounded-lg bg-navy-100", className)}
      aria-hidden
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3 p-5">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-2/5" />
    </div>
  );
}

/* ------------------------------------------------------------------ Tabs */

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
  tone = "teal",
}: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  tone?: "teal" | "pro";
}) {
  return (
    <div
      role="tablist"
      className={cx("no-scrollbar flex gap-1 overflow-x-auto", className)}
    >
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cx(
              "min-h-10 rounded-lg px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? tone === "pro"
                  ? "bg-pro-100 text-pro-800"
                  : "bg-navy-900 text-white"
                : "text-navy-600 hover:bg-navy-100",
            )}
          >
            {t.label}
            {typeof t.count === "number" ? (
              <span
                className={cx(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-[0.68rem]",
                  active ? "bg-white/20" : "bg-navy-100 text-navy-600",
                )}
              >
                {t.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- Fields */

export function Field({
  label,
  hint,
  children,
  required,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-navy-800">
        {label}
        {required ? <span className="text-urgent-600"> *</span> : null}
      </span>
      {hint ? <span className="muted mb-1.5 block text-xs">{hint}</span> : null}
      {children}
    </label>
  );
}

const INPUT_CLASS =
  "w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-[0.95rem] text-navy-900 placeholder:text-navy-300 focus:border-teal-500 focus:outline-none";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(INPUT_CLASS, "min-h-11", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(INPUT_CLASS, "resize-y", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(INPUT_CLASS, "min-h-11", props.className)} />;
}

export function Toggle({
  checked,
  onChange,
  label,
  describedBy,
  disabled,
  tone = "teal",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  describedBy?: string;
  disabled?: boolean;
  tone?: "teal" | "urgent";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative isolate inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors disabled:opacity-50",
        checked
          ? tone === "urgent"
            ? "border-urgent-600 bg-urgent-600"
            : "border-teal-700 bg-teal-700"
          : "border-navy-200 bg-navy-100",
      )}
    >
      <span
        className={cx(
          "absolute h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "left-6" : "left-0.5",
        )}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ Meta */

export function Stat({
  label,
  value,
  hint,
  tone = "navy",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: BadgeTone;
  className?: string;
}) {
  const bar: Record<BadgeTone, string> = {
    navy: "bg-navy-700",
    teal: "bg-teal-600",
    mint: "bg-mint-600",
    info: "bg-info-600",
    amber: "bg-amber-500",
    urgent: "bg-urgent-600",
    pro: "bg-pro-600",
    neutral: "bg-navy-300",
  };
  return (
    <div className={cx("card relative overflow-hidden p-4", className)}>
      <span className={cx("absolute top-0 left-0 h-full w-1", bar[tone])} aria-hidden />
      <p className="muted text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-navy-900 tabular-nums">{value}</p>
      {hint ? <p className="muted mt-0.5 text-xs">{hint}</p> : null}
    </div>
  );
}

export function Timeline({
  items,
}: {
  items: { id: string; at: string; title: React.ReactNode; body?: React.ReactNode }[];
}) {
  if (!items.length) {
    return <p className="muted text-sm">Nothing recorded yet.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l border-navy-100 pl-5">
      {items.map((i) => (
        <li key={i.id} className="relative">
          <span
            className="absolute top-1.5 -left-[1.44rem] h-2.5 w-2.5 rounded-full border-2 border-white bg-teal-600"
            aria-hidden
          />
          <p className="text-sm font-medium text-navy-900">{i.title}</p>
          <p className="muted text-xs">{i.at}</p>
          {i.body ? <div className="mt-1 text-sm text-navy-700">{i.body}</div> : null}
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------- DataTable */

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
  caption?: string;
}) {
  if (!rows.length) {
    return <>{empty ?? <EmptyState title="Nothing to show" icon="📭" />}</>;
  }
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="bg-navy-900 text-white">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cx("px-4 py-3 text-xs font-semibold tracking-wide uppercase", c.className)}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              className={cx(
                idx % 2 ? "bg-navy-50/50" : "bg-white",
                onRowClick && "cursor-pointer hover:bg-teal-50",
              )}
            >
              {columns.map((c) => (
                <td key={c.key} className={cx("px-4 py-3 align-middle", c.className)}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ----------------------------------------------------------- Modal/Sheet */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  tone = "default",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "urgent" | "pro";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const width = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-3xl" : "max-w-lg";
  const accent =
    tone === "urgent"
      ? "border-t-4 border-t-urgent-500"
      : tone === "pro"
        ? "border-t-4 border-t-pro-500"
        : "border-t-4 border-t-teal-600";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-navy-950/45 p-0 sm:items-center sm:p-4">
      <button
        aria-label="Close"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          "animate-fade-up relative max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-float sm:rounded-2xl",
          width,
          accent,
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-navy-900">
              {title}
            </h2>
            {description ? (
              <div className="muted mt-1 text-sm">{description}</div>
            ) : null}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="-mt-1 -mr-1 rounded-lg p-2 text-navy-400 hover:bg-navy-100 hover:text-navy-700"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-navy-100 bg-white/95 px-5 py-4 backdrop-blur">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-navy-950/45">
      <button aria-label="Close" className="flex-1 cursor-default" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex h-full w-full max-w-md flex-col bg-white shadow-float"
      >
        <header className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-navy-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-lg p-2 text-navy-400 hover:bg-navy-100"
          >
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="border-t border-navy-100 px-5 py-4">{footer}</footer>
        ) : null}
      </aside>
    </div>
  );
}

/* ---------------------------------------------------------------- Alerts */

export function Callout({
  tone = "info",
  title,
  children,
  icon,
  className,
}: {
  tone?: "info" | "mint" | "amber" | "urgent" | "pro" | "navy";
  title?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  const tones = {
    info: "bg-info-50 border-info-200 text-info-900",
    mint: "bg-mint-50 border-mint-200 text-mint-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    urgent: "bg-urgent-50 border-urgent-200 text-urgent-900",
    pro: "bg-pro-50 border-pro-200 text-pro-900",
    navy: "bg-navy-50 border-navy-200 text-navy-900",
  } as const;
  return (
    <div className={cx("rounded-xl border p-3.5 text-sm", tones[tone], className)}>
      <div className="flex gap-2.5">
        {icon ? (
          <span className="mt-0.5 shrink-0" aria-hidden>
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          {title ? <p className="font-semibold">{title}</p> : null}
          {children ? <div className={cx(title && "mt-0.5")}>{children}</div> : null}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Disclose */

export function Disclosure({
  summary,
  children,
  defaultOpen,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className="rounded-xl border border-navy-100 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-navy-800"
      >
        {summary}
        <span aria-hidden className="muted text-xs">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open ? (
        <div className="border-t border-navy-100 px-4 py-3 text-sm text-navy-700">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------- Toaster */

export { Toaster } from "./Toaster";
