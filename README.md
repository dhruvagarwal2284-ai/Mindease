# MindEase Campus

A working frontend prototype of a privacy-first digital psychological support
platform for students — anonymous peer support, a private journal and mood
history, an explainable support-indicator model, and a counsellor platform where
a human makes every decision.

Built against SIH problem statement **SW-55**.

## Quick start

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

There is no backend, no database and no account to create. Everything runs in
the browser.

> **Heads up before you build:** `npm run build` currently fails the type check.
> See [Known issues](#known-issues) — `npm run dev` is unaffected.

## Running the demo

Open **<http://localhost:3000/demo>**. It is a presenter's companion: the ten
demo steps with the exact route for each one (clickable), what to say, what the
audience should notice, reset controls, and switches for the two failure states.

Reset with demo history before you present — the longitudinal support indicator
needs four weeks of check-ins to have anything real to compute from. The reset
and the failure switches live on this page and nowhere else.

The short version of the story:

> anonymous onboarding → community → private reflection → support indicator →
> explicit counselling opt-in → counsellor review → support action → aggregate
> trends, with no identity exposure anywhere along the line.

## The two student roles

Onboarding ends by asking how the student wants to start:

- **Seeking support** (default) — journal, check-ins, resources, and peer or
  counsellor support when they want it.
- **Supporting peers** — opts in to be available for 1:1 anonymous chat.

The choice is a role mode, not an account. The pseudonym is identical either
way, and it can be switched at any time from the sidebar or Settings → Profile.
It changes the student navigation: supporters get Peer Hub and Leaderboard,
seekers get Talk to someone. `/register-as-peer` is a standalone landing-style
route for the same opt-in.

## Architecture

Next.js 15 (App Router), React 19, TypeScript in strict mode, Tailwind v4. No
UI framework, no chart library — every component and every chart is in this
repository.

```
app/
├─ page.tsx              landing: the privacy promise, before anything is collected
├─ onboarding/           seven-step privacy-first onboarding, ending in the role choice
├─ register-as-peer/     standalone peer-supporter opt-in
├─ demo/                 presenter's companion, reset + failure switches
├─ student/              mobile-first, bottom navigation
│  ├─ home/              greeting, daily check-in, quick actions, recommended reading
│  ├─ community/         feed, post detail, composer, saved
│  ├─ journal/           entries, editor, single entry, mood pattern, trends
│  ├─ peer/              anonymous 1:1 peer chat (cross-tab, see below)
│  ├─ leaderboard/       peer-supporter recognition (supporting mode only)
│  ├─ support/           resource hub, resource reader, counselling request, appointments
│  ├─ help/              crisis / immediate-help screen — reachable without onboarding
│  └─ settings/          profile, privacy, notifications, blocked, a11y, data
└─ counsellor/           desktop-first, sidebar, dense
   ├─ dashboard/         today's overview, priority queue, campus preview
   ├─ alerts/            anonymised queue + explainable alert detail
   ├─ cases/             case list + case detail with the consent boundary
   ├─ appointments/      month calendar + day panel + status tables
   ├─ moderation/        AI flags, student reports, human decisions, audit trail
   ├─ resources/         library, resource authoring, recommendation explainability
   ├─ analytics/         aggregated campus trends with a suppression threshold
   └─ settings/          role capability matrix, audit logs

components/
├─ ui/               Button, Card, Badge, Chip, Tabs, Modal, Drawer, DataTable, …
├─ privacy/          the privacy primitives (see below)
├─ support/          support-indicator surfaces, HumanReviewBanner
├─ charts/           all SVG charts, hand-rolled
├─ community/        PostCard, ReplyCard, reactions, reporting
├─ journal/          PrivateSpaceHeader, JournalEditor, JournalCard
├─ checkin/          the daily check-in
├─ nav/              student top bar + sidebar + bottom nav, counsellor sidebar, notifications
├─ landing/          LandingHeader and LandingFooter, shared by the public routes
├─ MindEaseLogo.tsx  the lotus mark and wordmark
└─ ThemeSelector.tsx the six-theme picker

lib/
├─ types.ts             the whole domain model
├─ store.tsx            one client store, persisted to localStorage
├─ support-indicator.ts the explainable support model
├─ moderation.ts        pre-post content screening
├─ analytics.ts         campus aggregates + the suppression threshold
├─ privacy.ts           pseudonym generation, consent copy, shared-data scope
├─ resources.ts         resource library + crisis contact slots
├─ seed.ts              demo campus and the student's own history
└─ format.ts            moods, dates, small helpers

design-system/tokens.css   colour scales, radii, shadows
app/globals.css            base styles, a11y modes, the six theme blocks
docs/spec-digest.md        the condensed source spec each screen was built against
docs/MindEase-Defect-Register.pdf   current known defects, ranked
```

### State

`lib/store.tsx` holds the entire application state in one React context and
persists it to `localStorage` under `mindease.campus.v1`.

**This is a prototype decision.** It stands in for the platform's protected
on-device storage model and makes the whole end-to-end journey demonstrable in
one browser with no server — the student's actions genuinely drive what the
counsellor sees. `localStorage` is not encrypted storage, and a real deployment
would replace this layer entirely.

The store also carries the things that are easy to forget: an idle session lock,
an audit trail written on every consent and moderation decision, the student's
role mode, counsellor-authored resources, and simulated failure switches.

`peerChat` is stripped from persistence on the way out, because a conversation
that claims to be ephemeral should not survive a page reload.

## The privacy primitives

| Primitive | Where | What it does |
|---|---|---|
| `PrivacyBadge` | `components/privacy` | Anonymous / Private / Shared / Aggregate status |
| `AnonymousModeBar` | `components/privacy` | The persistent "Anonymous mode ON" bar in community contexts |
| `ConsentDialog` | `components/privacy` | Lists what WILL and what will NOT be shared, side by side, before anything is sent |
| `DataPermissionCard` | `components/privacy` | A single consent switch with the reason it exists |
| `SafeContentWarning` | `components/privacy` | Non-alarming reveal gate before potentially difficult content |
| `ReauthDialog` | `components/privacy` | Device-local re-authentication before a sensitive action |
| `LockScreen` | `components/privacy` | Idle session lock after 15 minutes |
| `SupportLevelBadge` / `IndicatorPanel` | `components/support` | AI signals communicated without medicalising them — counsellor-side only |
| `HumanReviewBanner` | `components/support` | The standing reminder that model output is not a diagnosis |
| `StudentSupportPrompt` | `components/support` | The student-facing offer: no level, no score, no percentage |

## The support-indicator model

`lib/support-indicator.ts`. A **transparent, rule-based stand-in** for what
would be a trained model in production. It reads the student's own check-ins and
journal moods over four weeks and emits up to nine signals — sustained low
mood, negative mood trend, consecutive difficult days, academic stress, social
withdrawal, sleep disruption, financial pressure, low mood while journalling,
and one acute signal: recent crisis-related language on the student's own
content.

Every signal carries the plain-language evidence that produced it, because the
counsellor UI has to answer *why does this alert exist?*

- Thresholds and weights: `computeSupportIndicator` in
  `lib/support-indicator.ts`. Total weight ≥ 2 is moderate, ≥ 4 is high.
- **Longitudinal mood evidence alone tops out at "high".** "Critical" carries a
  specific operational meaning — immediate review under the institutional
  safety protocol — and this model has no way to see acute risk except through
  a crisis flag raised on the student's own content. Letting a run of low
  check-ins reach "critical" would tell a counsellor something the evidence does
  not support, and would blunt the level that should mean the most. So critical
  requires that acute signal to be present.
- "Model confidence" describes how much evidence the signals rest on. It is
  **not** a probability of illness, and the panel says so on screen.
- The student never sees the level, the confidence, the weights or the word
  "risk". `shouldPromptStudent()` decides only whether to make a supportive
  offer.

Being rule-based is a feature for a jury: every alert on the counsellor screen
can be traced back to specific check-ins in front of them.

## Moderation

`lib/moderation.ts` screens content before it is published. Crisis language
takes precedence over everything else and produces a **supportive** response —
an offer of help alongside the option to post anyway — never a block and never
an internal label like "HIGH RISK".

A crisis flag still reaches the counsellor's queue, because the spec requires it
to be routed for a supportive response. The distinction the code makes is that a
crisis flag **does not hold the post back** — it publishes as normal and raises
a queue item asking for support, whereas the other flags offer the author a
review before publishing. That queue item is also the only acute input the
support-indicator model has.

Other flags (harmful advice, harassment,
misinformation, and identifiers that would de-anonymise the author) offer the
author a review before publishing, then route to a human queue.

Also rule-based, also deliberately readable.

**Screening covers posts and replies only.** Peer chat messages are not screened
— see [Known issues](#known-issues).

## Peer chat

`/student/peer` matches a student in seeking mode with one in supporting mode and
gives them a 1:1 conversation. Nothing is written to the store and nothing is
persisted; leaving ends the session.

The transport is the browser's **`BroadcastChannel` API**, so matching and
messaging work between two tabs or windows of the *same browser on the same
machine* — enough to demonstrate the flow end to end without a server. Across
real devices this layer would be a lightweight realtime service (WebSockets,
Supabase Realtime, Firebase Presence). Two "simulate" buttons on the waiting
screen let you show a match without opening a second tab.

## The aggregation threshold

`lib/analytics.ts` exports `MIN_AGGREGATION` (5) and `applyThreshold()`. Any
group smaller than the threshold is suppressed rather than displayed — a bar of
height 2 in a small department is not an aggregate, it is two identifiable
students. The suppressed rows show neither name nor counts, because naming them
while withholding the numbers still narrows the field.

The analytics screen exposes the threshold as a slider so the safeguard can be
demonstrated rather than merely claimed. In production it is a fixed policy
value.

## Accessibility and theming

Keyboard navigation with visible focus, screen-reader semantics, and labels on
every control are always on. Settings → Accessibility adds high contrast,
reduced motion and larger text, applied to the document root and honoured across
both roles. `prefers-reduced-motion` is respected automatically.

Charts never encode meaning in colour alone: every mood mark carries its emoji
and label, and each chart offers a "Show as a table" view. The mood ramp is a
diverging palette validated for colour-vision separation.

Six themes ship in `app/globals.css` — Ocean Calm (default), Sage, Lavender,
Warm Sunset, Midnight and Minimal — each overriding the navy and teal scales on
`html[data-theme]`. The picker is currently mounted on the student home screen
only, and Midnight is incomplete; see [Known issues](#known-issues).

## Not production

Stated plainly, because a prototype that hides its edges is worse than one that
names them:

- **No backend, no database, no API.** Everything is client-side.
- **No real authentication.** Role separation is a route split. A deployment
  must enforce role-based authorization and consent boundaries server-side — the
  counsellor settings screen says this on screen rather than implying the UI is
  the control.
- **No real crisis contacts.** Every entry in `CRISIS_CONTACTS` is
  `configured: false` and renders as an explicit "configured at deployment"
  notice. A wrong helpline number in a crisis is worse than no number, so this
  prototype ships none.
- **The moderation classifier and the support-indicator model are rule sets**,
  not trained models.
- **`localStorage` is not encrypted storage.** It is a readable stand-in for the
  protected on-device storage the product describes.
- **Peer chat is same-browser only.** `BroadcastChannel` does not cross devices.
- **Campus analytics are synthetic.** The figures in `lib/analytics.ts` are
  fixed sample data at campus scale; they are not derived from the store.
- **The leaderboard is illustrative.** Rankings and point totals are hard-coded.
- **No tests and no CI.** There is no test runner, no lint script and no
  pipeline gating what lands on `main`.

## Known issues

A full ranked defect register lives at
[`docs/MindEase-Defect-Register.pdf`](docs/MindEase-Defect-Register.pdf).
The ones worth knowing before you touch the code:

- **`npm run build` fails the type check** on three errors — a missing
  `setIdentity` store action in `app/register-as-peer`, and a `StudentTab` type
  in `components/nav` that was commented out while still being referenced.
  `npm run dev` does not type-check, which is why this is easy to miss.
- **The mobile bottom navigation stacks vertically.** The tab list is missing
  `flex`, so the tabs render as blocks and the bar covers much of a phone
  screen.
- **Peer chat shows a hard-coded "Previous Connections" panel** directly under a
  banner stating that nothing is saved. The two contradict each other.
- **The crisis dialog in the composer says nothing was notified**, but a crisis
  flag does create a counsellor queue item and notification. The routing is
  correct; the copy is not.
- **Peer chat messages are not screened** for crisis language, unlike posts and
  replies.
- **The notifications consent toggle has no effect** — `notify()` never reads
  it.
- **Onboarding preferences are discarded.** Step 5 collects concern tags and
  tells the student they are "stored on this device only";
  `completeOnboarding()` never receives them.
- **The Midnight theme is incomplete.** Each theme overrides 17 of the 74 colour
  tokens, so the semantic scales stay light in dark mode.
- **The body typeface never loads.** `--font-sans` is set to Nunito, which is
  not imported anywhere.
- **The counselling request flow no longer asks what the student wants help
  with** — the concern is hard-coded to "General support", though the consent
  dialog still lists it as a shared item.
- **Home shows two quick actions**, not the four the spec digest calls for; the
  two removed were "Talk to someone" and "Get help now".
- **`app/student/support/connect/` is an orphan route** superseded by
  `/student/peer`. Nothing links to it.
- **`next.config.ts` copies image files from absolute paths on one contributor's
  machine.** It is wrapped in a `try/catch` and no-ops elsewhere; the images it
  copies are already committed.

## Scripts

```bash
npm run dev        # development server (no type checking)
npm run build      # production build (also runs the type check — currently failing)
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

Run `npm run typecheck` before you push. Nothing else will catch a type error
for you.
