"use client";

import { cx } from "@/lib/format";
import { useStore } from "@/lib/store";

const TONES = {
  info: "border-info-200 bg-info-50 text-info-900",
  success: "border-mint-200 bg-mint-50 text-mint-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  urgent: "border-urgent-200 bg-urgent-50 text-urgent-900",
} as const;

const ICONS = { info: "ℹ️", success: "✅", warning: "⚠️", urgent: "🆘" } as const;

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  if (!toasts.length) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            "animate-fade-up pointer-events-auto flex w-full max-w-md items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-raised",
            TONES[t.tone],
          )}
        >
          <span aria-hidden>{ICONS[t.tone]}</span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{t.message}</p>
            {t.detail ? <p className="mt-0.5 opacity-80">{t.detail}</p> : null}
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
