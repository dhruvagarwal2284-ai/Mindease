"use client";

import Link from "next/link";
import { useMemo } from "react";

import { AwardBadge, type AwardKind } from "@/components/ui/award-badge";
import { Badge, Card, LinkButton, SectionTitle } from "@/components/ui";
import { cx } from "@/lib/format";
import {
  awards,
  rankOf,
  standings,
  unansweredPosts,
  windowStart,
  type Standing,
} from "@/lib/leaderboard";
import { useStore } from "@/lib/store";

/** How many of the board is public. Deliberately short — see the note below. */
const VISIBLE_RANKS = 5;

const AWARD_COPY: Record<AwardKind, { blurb: string; unit: (n: number) => string }> = {
  "top-supporter": { blurb: "Highest total this week.", unit: (n) => `${n} points` },
  "most-thanked": {
    blurb: "Most support reactions received from other students.",
    unit: (n) => `${n} thanks`,
  },
  "first-response": {
    blurb: "Got to the most posts that nobody had answered yet.",
    unit: (n) => `${n} answered first`,
  },
  "steady-presence": {
    blurb: "Showed up on the most separate days. Regularity, not volume.",
    unit: (n) => `${n} days`,
  },
};

export default function LeaderboardPage() {
  const { state } = useStore();
  const myHandle = state.identity?.handle ?? "MindMate";

  const since = useMemo(() => windowStart(7), []);
  const rows = useMemo(() => standings(state.replies ?? [], since), [state.replies, since]);
  const held = useMemo(() => awards(rows), [rows]);
  const waiting = useMemo(
    () => unansweredPosts(state.posts ?? [], state.replies ?? []),
    [state.posts, state.replies],
  );

  const myRank = rankOf(rows, myHandle);
  const me = rows.find((r) => r.handle === myHandle);
  const leader = rows[0];
  const iLead = leader?.handle === myHandle;

  return (
    <div className="stagger max-w-3xl space-y-6">
      <SectionTitle
        title="Peer supporters"
        subtitle="Who has been showing up for people on this campus this week."
      />

      {/* The actual motivator. A number you could reach is weaker than a person
          who is currently being ignored, so the unanswered queue leads. */}
      {waiting.length > 0 ? (
        <Card className="border-amber-200 bg-amber-50/70">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-amber-900">
                {waiting.length} {waiting.length === 1 ? "post has" : "posts have"} no reply yet
              </h2>
              <p className="mt-1 text-sm text-amber-800">
                Someone wrote something down and nobody has answered. Being first is worth
                the most here — three points, against one for a thank-you.
              </p>
            </div>
            <LinkButton href="/student/community?tab=Unanswered">Go answer one</LinkButton>
          </div>
        </Card>
      ) : (
        <Card className="border-mint-200 bg-mint-50/70">
          <h2 className="text-lg font-semibold tracking-tight text-mint-900">
            Every post has an answer
          </h2>
          <p className="mt-1 text-sm text-mint-800">
            Nobody on the feed is currently waiting. That is the whole point of this page.
          </p>
        </Card>
      )}

      {/* Awards — the aspirational half. A badge is a thing you keep; a rank is
          just where you happen to sit today. */}
      <section aria-labelledby="awards-heading">
        <h2 id="awards-heading" className="mb-3 text-lg font-semibold tracking-tight text-navy-900">
          This week&rsquo;s awards
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <AwardCard
            kind="top-supporter"
            place={1}
            winner={leader ? { handle: leader.handle, value: leader.score } : null}
            mine={iLead}
          />
          {(["most-thanked", "first-response", "steady-presence"] as const).map((kind, i) => (
            <AwardCard
              key={kind}
              kind={kind}
              place={i + 1}
              winner={held[kind]}
              mine={held[kind]?.handle === myHandle}
            />
          ))}
        </div>
      </section>

      {/* Top few only. Publishing a full ranking in a mental-health app puts a
          number on being near the bottom, and the people near the bottom are
          often the ones who came here for help. Your own standing is shown to
          you privately below instead. */}
      <section aria-labelledby="board-heading">
        <h2 id="board-heading" className="mb-3 text-lg font-semibold tracking-tight text-navy-900">
          Top {VISIBLE_RANKS} this week
        </h2>

        {rows.length === 0 ? (
          <Card className="text-center">
            <p className="text-sm font-medium text-navy-900">Nobody is on the board yet.</p>
            <p className="muted mt-1 text-sm">
              The first reply of the week starts it. That could be yours.
            </p>
            <LinkButton href="/student/community" className="mt-4">
              Open the community
            </LinkButton>
          </Card>
        ) : (
          <ol className="space-y-2">
            {rows.slice(0, VISIBLE_RANKS).map((row, i) => (
              <StandingRow key={row.handle} row={row} rank={i + 1} mine={row.handle === myHandle} />
            ))}
          </ol>
        )}

        {/* Only shown when you are outside the visible ranks, so nobody is told
            in public that they are 34th. */}
        {me && myRank && myRank > VISIBLE_RANKS ? (
          <>
            <p className="muted my-2 text-center text-xs">· · ·</p>
            <StandingRow row={me} rank={myRank} mine />
          </>
        ) : null}

        {!me ? (
          <Card className="mt-3 border-dashed bg-transparent text-center shadow-none">
            <p className="muted text-sm">
              You have not replied to anyone this week, so you are not on the board.
              There is no penalty for that — it resets every Monday.
            </p>
          </Card>
        ) : null}
      </section>

      <Card>
        <h2 className="text-base font-semibold text-navy-900">How this is counted</h2>
        <ul className="muted mt-2 space-y-1.5 text-sm">
          <li>
            <strong className="text-navy-800">3 points</strong> — first to reply to a post that
            had no answers.
          </li>
          <li>
            <strong className="text-navy-800">1 point</strong> — each support reaction another
            student leaves on your reply.
          </li>
          <li>
            <strong className="text-navy-800">Nothing</strong> — for how many messages you send,
            how long you stay in a chat, or how fast you reply.
          </li>
        </ul>
        <p className="muted mt-3 border-t border-navy-100 pt-3 text-xs">
          Volume is deliberately not scored. Nobody is helped better by being someone&rsquo;s
          fortieth conversation of the week, and a board that rewarded that would push
          supporters to take on more than they can carry.
        </p>
      </Card>
    </div>
  );
}

function AwardCard({
  kind,
  place,
  winner,
  mine,
}: {
  kind: AwardKind;
  place: number;
  winner: { handle: string; value: number } | null;
  mine: boolean;
}) {
  const copy = AWARD_COPY[kind];
  return (
    <Card className={cx("flex flex-col gap-3", mine && "border-teal-300 ring-1 ring-teal-200")}>
      <div className={cx(!winner && "opacity-35 grayscale")}>
        <AwardBadge kind={kind} place={place} period="This week" />
      </div>
      <div>
        <p className="text-sm font-semibold text-navy-900">
          {winner ? (mine ? "You hold this" : winner.handle) : "Not claimed yet"}
          {winner ? (
            <Badge tone={mine ? "teal" : "neutral"} className="ml-2 align-middle">
              {copy.unit(winner.value)}
            </Badge>
          ) : null}
        </p>
        <p className="muted mt-1 text-xs">{copy.blurb}</p>
      </div>
    </Card>
  );
}

const MEDAL = ["🥇", "🥈", "🥉"];

function StandingRow({ row, rank, mine }: { row: Standing; rank: number; mine: boolean }) {
  return (
    <li
      className={cx(
        "card animate-hover-shake flex items-center gap-4 p-4",
        mine && "border-teal-300 ring-1 ring-teal-200",
      )}
    >
      <span className="w-8 shrink-0 text-center text-lg" aria-hidden>
        {MEDAL[rank - 1] ?? <span className="muted text-sm font-semibold">{rank}</span>}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-navy-900">
          {mine ? `You · ${row.handle}` : row.handle}
          <span className="sr-only">, rank {rank}</span>
        </p>
        <p className="muted mt-0.5 text-xs">
          {row.thanks} thanks · {row.firstReplies} answered first · {row.daysPresent}{" "}
          {row.daysPresent === 1 ? "day" : "days"} present
        </p>
      </div>
      <Badge tone={mine ? "teal" : "amber"} className="shrink-0">
        {row.score} points
      </Badge>
    </li>
  );
}
