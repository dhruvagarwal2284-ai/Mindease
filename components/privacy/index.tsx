"use client";

import { useState } from "react";
import { Badge, Button, Callout, Modal, Toggle } from "@/components/ui";
import { cx } from "@/lib/format";
import { SCOPE_COPY, scopeSummary, withheldSummary } from "@/lib/privacy";
import { useStore } from "@/lib/store";
import type { SharedDataScope } from "@/lib/types";

/* ---------------------------------------------------------- PrivacyBadge */

export type PrivacyStatus =
  | "anonymous"
  | "private"
  | "shared"
  | "aggregate"
  /** counsellor-side: the CASE is anonymous, not the viewer */
  | "identity-withheld";

const STATUS: Record<
  PrivacyStatus,
  { label: string; icon: string; tone: "teal" | "info" | "amber" | "navy" }
> = {
  anonymous: { label: "Anonymous mode ON", icon: "🕶️", tone: "teal" },
  private: { label: "Private to you", icon: "🔒", tone: "info" },
  shared: { label: "Shared with your counsellor", icon: "🤝", tone: "amber" },
  aggregate: { label: "Aggregated — no identities", icon: "📊", tone: "navy" },
  "identity-withheld": { label: "Identity withheld", icon: "🕶️", tone: "navy" },
};

export function PrivacyBadge({
  status,
  className,
  compact,
}: {
  status: PrivacyStatus;
  className?: string;
  compact?: boolean;
}) {
  const s = STATUS[status];
  return (
    <Badge tone={s.tone} className={className} icon={<span aria-hidden>{s.icon}</span>}>
      {compact ? s.label.split(" ")[0] : s.label}
    </Badge>
  );
}

/** The persistent bar the spec asks for in every community context. */
export function AnonymousModeBar({ className }: { className?: string }) {
  const { state } = useStore();
  return (
    <div
      className={cx(
        "flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-900",
        className,
      )}
    >
      <span aria-hidden>🕶️</span>
      <span className="font-semibold">Anonymous mode ON</span>
      <span className="hidden text-teal-800/80 sm:inline">
        · you appear as {state.identity?.handle ?? "an anonymous student"}
      </span>
    </div>
  );
}

/* --------------------------------------------------- DataPermissionCard  */

export function DataPermissionCard({
  label,
  why,
  checked,
  onChange,
  sensitive,
  disabled,
  disabledReason,
}: {
  label: string;
  why: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  sensitive?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <div
      className={cx(
        "flex items-start justify-between gap-4 rounded-xl border p-4",
        checked
          ? sensitive
            ? "border-amber-200 bg-amber-50/60"
            : "border-mint-200 bg-mint-50/60"
          : "border-navy-100 bg-white",
      )}
    >
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-medium text-navy-900">
          {label}
          <Badge tone={checked ? (sensitive ? "amber" : "mint") : "neutral"}>
            {checked ? "ON" : "OFF"}
          </Badge>
        </p>
        <p className="muted mt-1 text-sm">{why}</p>
        {disabled && disabledReason ? (
          <p className="mt-1 text-xs text-navy-500 italic">{disabledReason}</p>
        ) : null}
      </div>
      <Toggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        label={label}
        tone={sensitive ? "urgent" : "teal"}
      />
    </div>
  );
}

/* ----------------------------------------------------------- ConsentDialog */

export function ConsentDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm what will be shared",
  scope,
  purpose,
  confirmLabel = "I consent — share exactly this",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  scope: SharedDataScope;
  purpose: string;
  confirmLabel?: string;
}) {
  const shared = scopeSummary(scope);
  const withheld = withheldSummary(scope);
  const [understood, setUnderstood] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={purpose}
      footer={
        <>
          <Button onClick={onClose}>Go back</Button>
          <Button
            tone="primary"
            disabled={!understood}
            onClick={() => {
              onConfirm();
              setUnderstood(false);
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-navy-900">
            Will be shared ({shared.length})
          </p>
          <ul className="space-y-1.5">
            {shared.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-navy-800">
                <span className="text-mint-600" aria-hidden>
                  ✓
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-navy-900">
            Will NOT be shared ({withheld.length})
          </p>
          <ul className="space-y-1.5">
            {withheld.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-navy-500">
                <span aria-hidden>✕</span>
                {s}
              </li>
            ))}
            <li className="flex gap-2 text-sm text-navy-500">
              <span aria-hidden>✕</span>
              Your name, email, roll number or device identifiers
            </li>
          </ul>
        </div>

        <Callout tone="info" icon="ℹ️">
          You can withdraw this at any time from Settings. Withdrawing detaches the shared
          data from the case.
        </Callout>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-navy-200 p-3">
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-teal-700"
          />
          <span className="text-sm text-navy-800">
            I understand what is being shared and I am choosing to share it.
          </span>
        </label>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------ SafeContentWarning */

export function SafeContentWarning({
  reason,
  children,
}: {
  reason: string;
  children: React.ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);
  if (revealed) return <>{children}</>;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <p className="text-sm font-medium text-amber-900">Sensitive content</p>
      <p className="mt-0.5 text-sm text-amber-800">{reason}</p>
      <Button size="sm" className="mt-3" onClick={() => setRevealed(true)}>
        Show anyway
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------ ReauthDialog */

/**
 * Device-local re-authentication for sensitive actions. There is no password
 * in this prototype by design — proving you hold the device by retyping the
 * pseudonym suffix is the honest equivalent.
 */
export function ReauthDialog({
  open,
  onClose,
  onVerified,
  action,
}: {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  action: string;
}) {
  const { state } = useStore();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const expected = (state.identity?.handle.split("#")[1] ?? "").trim().toUpperCase();

  const submit = () => {
    if (value.trim().toUpperCase() === expected) {
      setValue("");
      setError(null);
      onVerified();
    } else {
      setError("That does not match the code shown above. Check for typos.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setValue("");
        setError(null);
        onClose();
      }}
      title="Confirm it is you"
      tone="urgent"
      size="sm"
      description={`This confirms a sensitive action: ${action}`}
      footer={
        <>
          <Button
            onClick={() => {
              setValue("");
              setError(null);
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button tone="urgent" onClick={submit}>
            Confirm
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-navy-700">
          Type the code from your anonymous identity to continue.
        </p>
        <p className="rounded-xl bg-navy-50 px-4 py-3 text-center font-mono text-xl tracking-[0.3em] text-navy-900">
          {expected || "—"}
        </p>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          aria-label="Confirmation code"
          autoComplete="off"
          className="w-full rounded-xl border border-navy-200 px-3.5 py-3 text-center font-mono text-lg tracking-[0.3em] uppercase focus:border-teal-500 focus:outline-none"
          placeholder="•••••"
        />
        {error ? <p className="text-sm text-urgent-700">{error}</p> : null}
      </div>
    </Modal>
  );
}

/* --------------------------------------------------------------- LockScreen */

export function LockScreen() {
  const { locked, unlock, state } = useStore();
  if (!locked) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/95 p-6 text-center">
      <div className="max-w-sm">
        <div className="text-4xl" aria-hidden>
          🔒
        </div>
        <h1 className="mt-4 text-xl font-semibold text-white">Session locked</h1>
        <p className="mt-2 text-sm text-navy-200">
          MindEase locked itself after 15 minutes of inactivity so nobody can read your
          screen over your shoulder. Nothing was lost.
        </p>
        <p className="mt-4 text-sm text-navy-300">
          You are {state.identity?.handle ?? "an anonymous student"}
        </p>
        <Button tone="primary" full className="mt-5" onClick={unlock}>
          Unlock and continue
        </Button>
      </div>
    </div>
  );
}
