"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Callout, Field, Input, SkeletonCard } from "@/components/ui";
import { cx } from "@/lib/format";
import { CRISIS_CONTACTS } from "@/lib/resources";
import { useStore } from "@/lib/store";
import type { CrisisContact } from "@/lib/resources";

const GROUNDING = [
  {
    title: "Slow the breath down first",
    body: "Breathe in for four, hold for four, out for six. Six or seven rounds. It is not a cure — it buys you the minutes you need to think.",
  },
  {
    title: "Get yourself near another person",
    body: "A corridor, a mess hall, a friend's room. You do not have to explain anything to them. Proximity is enough.",
  },
  {
    title: "Step away from whatever is escalating it",
    body: "Close the tab, leave the chat, put the phone in a drawer. The conversation will still be there when you are steadier.",
  },
  {
    title: "Name five things you can see",
    body: "Out loud if you can. It pulls attention back out of the spiral and into the room you are actually in.",
  },
  {
    title: "Postpone the decision",
    body: "Whatever feels like it has to be settled tonight almost never does. Give yourself until tomorrow morning.",
  },
];

function ContactList({ contacts }: { contacts: CrisisContact[] }) {
  return (
    <div className="space-y-2.5">
      {contacts.map((c) => (
        <div key={c.id} className="rounded-xl border border-navy-200 bg-white p-3.5">
          <p className="font-medium text-navy-900">{c.label}</p>
          <p className="muted mt-0.5 text-sm">{c.detail}</p>
          <p className="mt-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <span aria-hidden>⚙️</span> Not configured in this prototype — your institution
            supplies a verified number at deployment.
          </p>
        </div>
      ))}
    </div>
  );
}

export default function HelpPage() {
  const router = useRouter();
  const { ready, toast } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const [trustedName, setTrustedName] = useState("");
  const [trustedNumber, setTrustedNumber] = useState("");
  const [safeAck, setSafeAck] = useState(false);

  if (!ready) return <SkeletonCard />;

  const toggle = (key: string) => setOpen((o) => (o === key ? null : key));

  const Panel = ({ id, children }: { id: string; children: React.ReactNode }) =>
    open === id ? (
      <div className="animate-fade-up mt-2 rounded-2xl border border-navy-100 bg-navy-50/60 p-4">
        {children}
      </div>
    ) : null;

  const ActionButton = ({
    id,
    icon,
    label,
    sub,
    urgent,
    onClick,
  }: {
    id: string;
    icon: string;
    label: string;
    sub: string;
    urgent?: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      aria-expanded={open === id}
      className={cx(
        "flex min-h-16 w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-colors",
        urgent
          ? "border-urgent-300 bg-urgent-50 hover:bg-urgent-100"
          : "border-navy-200 bg-white hover:border-navy-300 hover:bg-navy-50",
      )}
    >
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cx(
            "block font-semibold",
            urgent ? "text-urgent-900" : "text-navy-900",
          )}
        >
          {label}
        </span>
        <span className="muted block text-sm">{sub}</span>
      </span>
      <span className="muted shrink-0 text-sm" aria-hidden>
        {open === id ? "▲" : "›"}
      </span>
    </button>
  );

  return (
    <div className="space-y-5">
      <header>
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-urgent-700 uppercase">
          <span aria-hidden>🆘</span> Get help
        </p>
        <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-navy-900">
          Need immediate support?
        </h1>
        <p className="muted mt-2 text-base">
          You do not have to be in crisis to be here. Pick whichever of these is the
          smallest step you can take right now.
        </p>
      </header>

      <Callout tone="urgent" icon="⚠️" title="If someone is in immediate physical danger">
        Contact your local emergency services directly, by phone. MindEase is not an
        emergency service and cannot dispatch anyone.
      </Callout>

      <div className="space-y-2.5">
        <Link
          href="/student/support/request"
          className="flex min-h-16 w-full items-center gap-4 rounded-2xl border border-teal-300 bg-teal-50 px-4 py-3 text-left transition-colors hover:bg-teal-100"
        >
          <span className="text-2xl" aria-hidden>
            🤝
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-teal-900">Talk to someone now</span>
            <span className="muted block text-sm">
              Ask a campus counsellor for a conversation. You choose what they see.
            </span>
          </span>
          <span className="muted shrink-0 text-sm" aria-hidden>
            ›
          </span>
        </Link>

        <ActionButton
          id="emergency"
          icon="🚑"
          label="Emergency help"
          sub="Numbers for when things are urgent right now."
          urgent
          onClick={() => toggle("emergency")}
        />
        <Panel id="emergency">
          <ContactList contacts={CRISIS_CONTACTS.filter((c) => c.kind === "national")} />
          <p className="muted mt-3 text-xs">
            A prototype must not ship invented helpline numbers — a wrong number in a crisis
            is worse than no number. These slots are filled from verified institutional and
            local sources at deployment.
          </p>
        </Panel>

        <ActionButton
          id="campus"
          icon="🏫"
          label="Campus counselling"
          sub="The counselling centre and the out-of-hours warden."
          onClick={() => toggle("campus")}
        />
        <Panel id="campus">
          <ContactList contacts={CRISIS_CONTACTS.filter((c) => c.kind === "campus")} />
        </Panel>

        <ActionButton
          id="grounding"
          icon="🌿"
          label="Crisis resources"
          sub="Things that help in the next ten minutes."
          onClick={() => toggle("grounding")}
        />
        <Panel id="grounding">
          <ol className="space-y-3">
            {GROUNDING.map((g, i) => (
              <li key={g.title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-navy-700">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-navy-900">{g.title}</p>
                  <p className="muted mt-0.5 text-sm">{g.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>

        <ActionButton
          id="trusted"
          icon="👤"
          label="Trusted person"
          sub="Keep one number where you can find it without thinking."
          onClick={() => toggle("trusted")}
        />
        <Panel id="trusted">
          <div className="space-y-3">
            <Field label="Their name">
              <Input
                value={trustedName}
                onChange={(e) => setTrustedName(e.target.value)}
                placeholder="Someone you would actually call"
              />
            </Field>
            <Field label="Their number">
              <Input
                value={trustedNumber}
                onChange={(e) => setTrustedNumber(e.target.value)}
                placeholder="Phone number"
                inputMode="tel"
              />
            </Field>
            <Callout tone="info" icon="🔒">
              This stays in this browser tab only. This prototype deliberately does not save
              it anywhere — not to your account, not to a server, not even to this device
              between visits.
            </Callout>
            {trustedName && trustedNumber ? (
              <div className="rounded-xl border border-mint-200 bg-mint-50 p-3.5">
                <p className="text-sm font-medium text-mint-900">
                  If it gets bad, call {trustedName}
                </p>
                <p className="mt-0.5 font-mono text-lg text-navy-900">{trustedNumber}</p>
              </div>
            ) : null}
          </div>
        </Panel>

        <button
          onClick={() => {
            setSafeAck(true);
            toast("Glad to hear it", "success", "Nothing was recorded.");
          }}
          className="flex min-h-16 w-full items-center gap-4 rounded-2xl border border-mint-300 bg-mint-50 px-4 py-3 text-left transition-colors hover:bg-mint-100"
        >
          <span className="text-2xl" aria-hidden>
            🌤️
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-mint-900">I am safe right now</span>
            <span className="muted block text-sm">
              Just checking in on this page. Nothing more needed.
            </span>
          </span>
        </button>

        {safeAck ? (
          <div className="animate-fade-up rounded-2xl border border-mint-200 bg-white p-4">
            <p className="font-medium text-navy-900">Good. That is genuinely worth saying.</p>
            <p className="muted mt-1 text-sm">
              This page is here whenever you want it, and looking at it costs you nothing.
              Nothing has been logged and nobody has been told you opened it.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button tone="primary" onClick={() => router.push("/student/home")}>
                Back to home
              </Button>
              <Button onClick={() => setSafeAck(false)}>Stay here a minute</Button>
            </div>
          </div>
        ) : null}

        <Button full size="lg" onClick={() => router.back()}>
          Go back
        </Button>
      </div>

      <p className="muted border-t border-navy-100 pt-4 text-center text-xs">
        <span aria-hidden>🔒</span> Opening this page is not recorded against you, does not
        appear on any dashboard, and does not notify a counsellor. Reaching for help is not
        evidence of anything.
      </p>
    </div>
  );
}
