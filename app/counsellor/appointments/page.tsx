"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  SectionTitle,
  SkeletonCard,
  Tabs,
} from "@/components/ui";
import type { Column } from "@/components/ui";
import { cx, formatDay, formatTime, isoDay } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Appointment, SupportMode } from "@/lib/types";

const MODE_STYLE: Record<SupportMode, { dot: string; badge: "pro" | "teal" | "info" | "mint" }> = {
  "In-person": { dot: "bg-pro-600", badge: "pro" },
  Video: { dot: "bg-teal-600", badge: "teal" },
  Chat: { dot: "bg-info-600", badge: "info" },
  Phone: { dot: "bg-mint-600", badge: "mint" },
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type TabKey = "upcoming" | "completed" | "cancelled";

export default function CounsellorAppointmentsPage() {
  const router = useRouter();
  const { ready, state, setAppointmentStatus, toast } = useStore();

  const today = new Date();
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState<string>(isoDay(today));
  const [tab, setTab] = useState<TabKey>("upcoming");

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of state.appointments) {
      const key = isoDay(new Date(a.at));
      map.set(key, [...(map.get(key) ?? []), a]);
    }
    for (const list of map.values()) list.sort((x, y) => (x.at < y.at ? -1 : 1));
    return map;
  }, [state.appointments]);

  if (!ready) return <SkeletonCard />;

  /* --------------------------------------------------------- calendar grid */
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  /** Monday-first offset: JS getDay() is 0=Sun. */
  const lead = (firstOfMonth.getDay() + 6) % 7;
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => isoDay(new Date(year, month, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedAppts = byDay.get(selected) ?? [];

  const caseFor = (a: Appointment) => state.cases.find((c) => c.caseId === a.caseId);

  const columns: Column<Appointment>[] = [
    {
      key: "when",
      header: "When",
      render: (a) => (
        <span className="font-medium text-navy-900">
          {formatDay(isoDay(new Date(a.at)))} · {formatTime(a.at)}
        </span>
      ),
    },
    {
      key: "case",
      header: "Case",
      render: (a) => <span className="font-mono text-xs">{a.caseId}</span>,
    },
    {
      key: "student",
      header: "Student",
      render: (a) =>
        a.identityVisible ? (
          <span className="font-mono text-xs">{caseFor(a)?.studentHandle ?? "—"}</span>
        ) : (
          <span className="muted text-xs italic">Anonymous until consent</span>
        ),
    },
    {
      key: "mode",
      header: "Mode",
      render: (a) => <Badge tone={MODE_STYLE[a.mode].badge}>{a.mode}</Badge>,
    },
    { key: "concern", header: "Concern", render: (a) => a.concern },
    {
      key: "actions",
      header: "Actions",
      render: (a) => (
        <div className="flex flex-wrap gap-1.5">
          {a.status !== "completed" ? (
            <Button
              size="sm"
              onClick={() => {
                setAppointmentStatus(a.id, "completed");
                toast("Marked completed", "success");
              }}
            >
              Complete
            </Button>
          ) : null}
          {a.status !== "cancelled" ? (
            <Button
              size="sm"
              tone="ghost"
              onClick={() => {
                setAppointmentStatus(a.id, "cancelled");
                toast("Appointment cancelled", "info");
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  const tabRows = state.appointments
    .filter((a) => a.status === tab)
    .sort((a, b) => (a.at < b.at ? 1 : -1));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Appointments</h1>
        <p className="muted mt-1 text-sm">
          Identity stays hidden on the calendar unless the student consented to linkage.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ---------------------------------------------------- calendar */}
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-navy-900">
              {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </h2>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                aria-label="Previous month"
                onClick={() => setCursor(new Date(year, month - 1, 1))}
              >
                ‹
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
                  setSelected(isoDay(now));
                }}
              >
                Today
              </Button>
              <Button
                size="sm"
                aria-label="Next month"
                onClick={() => setCursor(new Date(year, month + 1, 1))}
              >
                ›
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="muted pb-1 text-center text-xs font-semibold tracking-wide uppercase"
              >
                {d}
              </div>
            ))}
            {cells.map((iso, i) => {
              if (!iso) return <div key={`blank-${i}`} />;
              const appts = byDay.get(iso) ?? [];
              const isToday = iso === isoDay(new Date());
              const isSelected = iso === selected;
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  aria-pressed={isSelected}
                  aria-label={`${formatDay(iso)}, ${appts.length} appointments`}
                  className={cx(
                    "flex min-h-16 flex-col items-center rounded-lg border px-1 py-1.5 transition-colors",
                    isSelected
                      ? "border-pro-500 bg-pro-50"
                      : isToday
                        ? "border-teal-400 bg-teal-50/50"
                        : "border-navy-100 bg-white hover:bg-navy-50",
                  )}
                >
                  <span
                    className={cx(
                      "text-sm tabular-nums",
                      isToday ? "font-bold text-teal-800" : "text-navy-800",
                    )}
                  >
                    {Number(iso.slice(-2))}
                  </span>
                  {appts.length ? (
                    <>
                      <span className="mt-1 flex gap-0.5" aria-hidden>
                        {appts.slice(0, 4).map((a) => (
                          <span
                            key={a.id}
                            className={cx("h-1.5 w-1.5 rounded-full", MODE_STYLE[a.mode].dot)}
                          />
                        ))}
                      </span>
                      <span className="muted mt-0.5 text-[0.6rem] tabular-nums">
                        {appts.length}
                      </span>
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-navy-100 pt-3">
            {(Object.keys(MODE_STYLE) as SupportMode[]).map((m) => (
              <span key={m} className="flex items-center gap-1.5 text-xs text-navy-700">
                <span className={cx("h-2 w-2 rounded-full", MODE_STYLE[m].dot)} aria-hidden />
                {m}
              </span>
            ))}
          </div>
        </Card>

        {/* ------------------------------------------------- day panel */}
        <Card className="p-4 sm:p-5">
          <SectionTitle
            title={formatDay(selected)}
            subtitle={
              selectedAppts.length === 1
                ? "1 appointment"
                : `${selectedAppts.length} appointments`
            }
          />
          {selectedAppts.length === 0 ? (
            <p className="muted text-sm">Nothing booked on this day.</p>
          ) : (
            <ul className="space-y-2.5">
              {selectedAppts.map((a) => {
                const kase = caseFor(a);
                return (
                  <li key={a.id} className="rounded-xl border border-navy-100 p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-navy-900">{formatTime(a.at)}</p>
                      <Badge tone={MODE_STYLE[a.mode].badge}>{a.mode}</Badge>
                    </div>
                    <dl className="mt-2 space-y-1 text-sm">
                      <div className="flex gap-2">
                        <dt className="muted">Student:</dt>
                        <dd
                          className={
                            a.identityVisible
                              ? "font-mono text-xs text-navy-800"
                              : "text-navy-500 italic"
                          }
                        >
                          {a.identityVisible
                            ? (kase?.studentHandle ?? "—")
                            : "Anonymous until consent"}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="muted">Concern:</dt>
                        <dd className="text-navy-800">{a.concern}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="muted">Case:</dt>
                        <dd className="font-mono text-xs text-navy-800">{a.caseId}</dd>
                      </div>
                    </dl>
                    {kase ? (
                      <Button
                        size="sm"
                        className="mt-2.5"
                        onClick={() => router.push(`/counsellor/cases/${kase.id}`)}
                      >
                        Open case
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* --------------------------------------------------------- tables */}
      <section className="space-y-3">
        <Tabs
          tone="pro"
          value={tab}
          onChange={setTab}
          tabs={[
            {
              value: "upcoming",
              label: "Upcoming",
              count: state.appointments.filter((a) => a.status === "upcoming").length,
            },
            {
              value: "completed",
              label: "Completed",
              count: state.appointments.filter((a) => a.status === "completed").length,
            },
            {
              value: "cancelled",
              label: "Cancelled",
              count: state.appointments.filter((a) => a.status === "cancelled").length,
            },
          ]}
        />
        <DataTable
          columns={columns}
          rows={tabRows}
          rowKey={(a) => a.id}
          caption={`${tab} appointments`}
          empty={
            <EmptyState
              icon="📅"
              title={
                tab === "upcoming"
                  ? "No appointments scheduled"
                  : tab === "completed"
                    ? "Nothing completed yet"
                    : "Nothing cancelled"
              }
              body="Appointments booked from a case appear here."
            />
          }
        />
      </section>
    </div>
  );
}
