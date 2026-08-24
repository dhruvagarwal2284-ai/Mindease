# MindEase Campus — spec digest

Condensed from *MindEase Campus — Frontend Features & Architecture* (SIH problem
statement SW-55). This is the source of truth for what each screen must contain.

## 1. Product principles

- **Calm** — generous spacing, clear hierarchy, restrained use of urgent colours.
- **Private** — persistent privacy indicators: "Anonymous mode", "Private to you".
- **Human** — supportive microcopy, never clinical or judgmental.
- **Modern** — cards, chips, bottom navigation, clear empty states, responsive.
- **Non-stigmatizing** — never present ordinary emotional variation as pathology.

### Microcopy rules

- Say "support indicator", never "diagnosis".
- Say "talk to someone", never "submit a mental-health case".
- Say "private to you", never vague technical privacy jargon.
- Always explain *why* sensitive information is requested.
- Prefer choice-oriented language: "Would you like…?"

### The five rules

1. Privacy before personalization.
2. AI is not a clinician — support indicators and explainability only.
3. Human-in-the-loop — AI flags, a qualified human reviews and decides.
4. Consent creates the bridge — identity and counselling data only via explicit opt-in.
5. Measure support, not surveillance — analytics are aggregated.

## 2. Visual state model

| Colour | Meaning |
|---|---|
| green / mint | normal support, completed |
| blue (`info`) | information, privacy |
| amber | elevated, needs review |
| red (`urgent`) | genuine crisis / urgent workflow **only** |
| violet (`pro`) | counsellor / professional workspace |

Deep navy + teal carry trust, navigation and primary actions.

## 3. Student onboarding & privacy

Flow: Welcome → Why MindEase? → Privacy explained in plain language → choose /
receive pseudonymous identity → optional preferences → consent controls → Home.

Four privacy cards during onboarding: **Anonymous by default**, **Private
journal**, **AI support** ("can identify support indicators; it does not diagnose
mental illness"), **Counsellor pathway** ("explicit, clearly explained consent
pathway").

Pseudonymous identity looks like `MindMate #A7F29`. An "Anonymous mode ON"
indicator is persistent in community contexts. Do not push students to build a
public profile that invites identification.

Privacy education screen defaults:

```
Anonymous community participation ON
Private journal ON
AI support analysis ON
Counsellor sharing OFF
Journal sharing OFF
[ I understand & continue ]
```

## 4. Student home & daily check-in

Home answers one question fast: *"What support can I use right now?"* It must not
look like an analytics dashboard.

- Mood selector: Great / Good / Okay / Low / Struggling.
- Four quick actions: **Talk to someone**, **Write privately**, **Explore
  resources**, **Get help now**.
- Check-in: mood, "What's affecting you today?" chips (Academics, Exams,
  Relationships, Family, Finances, Sleep, Loneliness, Career, Hostel, Other),
  optional free text, clear save/skip, and a visible line: "Your check-in is used
  according to your privacy settings."

## 5. Anonymous peer-support community

Feels like a small, safety-oriented campus community, not a social network.

- Post card: anonymous author, relative time, body, reply count, support count,
  actions `[Support] [Reply] [Save]`.
- Tabs: **For You, Recent, Trending, Unanswered**.
- Topic filters: Academics, Relationships, Family, Loneliness, Career, Financial
  stress, Hostel life, General.
- Create-post CTA: "What's on your mind?"
- Report / block / hide from the post menu.
- Sensitive-content warnings before potentially triggering content is revealed.

Post creation: text, optional mood and topic, anonymous toggle, optional
content-warning tag, **pre-post safety/moderation check**, review prompt if
potentially harmful advice is detected.

Support reactions instead of likes: "I'm here for you", "Sending support",
"You're not alone", "I understand", "Keep going".

Reply composer shows: "Try to respond with empathy. Sharing your experience is
safer than presenting medical advice as fact." Flagged responses offer review
before publication.

## 6. Private journal & mood tracking

Visually and functionally separate from the community.

- Journal home header: "YOUR PRIVATE SPACE 🔒", `[+ New Entry]`, entry cards with
  date, mood, excerpt, tags.
- Editor: writing area, mood selector, optional tags, date and draft state, clear
  lock/private indicator, save draft and delete.
- Privacy indicator: "🔒 Private to you — Your journal entries are not visible to
  counsellors unless you explicitly choose to share them."
- Mood history: **never** a "mental health score". Use "Your check-in history" /
  "Your mood pattern" — a timeline of the student's own entries.
- Longitudinal support copy: "You've reported feeling stressed several times
  recently. Would you like to explore some support options?" Never "You are
  depressed."

## 7. Risk / support experience & counselling opt-in

Never expose numerical risk to students ("Risk = 87%" is forbidden). Surface a
supportive next step instead:

```
🫶 You may benefit from some extra support right now.
   You don't have to handle it alone.
   [Explore Support] [Talk to Someone]
```

Counselling request flow: Talk to a counsellor → What would you like help with?
(Academic stress / Anxiety & stress / Relationships / Loneliness / Family /
Career / Something else) → Preferred mode (Chat / In-person / Video / Phone) →
**What will be shared?** → explicit consent → request appointment.

The consent screen shows a concrete list of what will be shared. Nothing beyond
what is necessary is silently attached.

## 8. Crisis / help experience

Help stays easy to reach and is never buried in settings.

```
🆘 GET HELP
Need immediate support?
[ Talk to someone now ] [ Emergency help ] [ Campus counselling ]
[ Crisis resources ] [ Trusted person ] [ I am safe right now ] [ Go back ]
```

Emergency contacts must come from verified institutional sources — **do not
hard-code unverified numbers into the prototype**. If crisis language is detected
the interface stays calm and supportive; never show an internal label like "HIGH
RISK".

## 9. Student settings, consent & data controls

Profile/pseudonym management · privacy dashboard · consent management ·
notification settings · blocked users and hidden posts · accessibility settings ·
data deletion and export · counsellor connections and appointment history.

## 10–12. Counsellor platform

Desktop-first, information-dense, **decision support — not a surveillance
console**.

- Dashboard: "Good morning, Counsellor", today's overview tiles (Active support,
  New alerts, Students seeking help).
- Anonymized alert queue: `ID | Level | Trend | Recommended action`. The default
  view must not expose student identity; anonymous case IDs are used until the
  student opts in.
- Alert levels: **Critical** (immediate review per institutional safety
  protocol), **High** (elevated support indicator), **Moderate** (monitor or
  offer resources), **Informational** (aggregate/support context).
- Alert detail: anonymous case id, support indicators with evidence, four-week
  trend, model confidence, the line "These are model-detected signals, not a
  diagnosis", and actions `[Review] [Offer support] [Request voluntary contact]
  [Mark reviewed] [False positive] [Escalate]`.
- **Critical design rule:** AI must not automatically contact, identify or punish
  a student. The flow is AI signal → alert → counsellor review → human decision →
  support action.
- Case page: overview (student-selected concern, preferred mode, status),
  appointments, student-shared information (**only explicitly consented items**),
  private counsellor notes, follow-up.
- Case actions: review, record note, offer resource, request voluntary contact,
  schedule appointment, record follow-up, close/archive.
- Appointment calendar; clicking an appointment shows "Student: Anonymous until
  consent", mode, concern, time.

## 13. Moderation & community safety

Queue counters: new reports, AI flagged, under review, resolved.
Flow: post → reason flagged (misinformation / harassment / harmful content /
crisis concern) → human action → approve / remove / warn / restrict / escalate /
false positive.
Also: attach a support/resource response, and maintain an audit trail.

## 14. Aggregated analytics

Aggregated and privacy-preserving; the value is understanding support demand, not
identifying vulnerable students. Reported-concern bars, time trend, and an
**aggregation threshold** that suppresses any group below the minimum so
individuals cannot be re-identified.

## 15. Notifications, accessibility, responsive

Student notifications: peer reply, counsellor response, appointment reminder,
support follow-up, resource recommendation.
Counsellor notifications: new support alert, new student request, appointment,
follow-up due, moderation queue item.
Push previews must not expose sensitive content — "You have a new MindEase
update" rather than the message body.

Accessibility: keyboard navigation with visible focus, screen-reader semantics,
scalable typography, high-contrast mode, reduced motion, large touch targets,
clear error messages, plain-language microcopy, language support.

Responsive: student = mobile-first, bottom nav, large touch targets, minimal
forms. Counsellor = desktop/tablet, sidebar, tables, charts, calendar,
multi-panel detail.

## 16. Security UX & failure states

| Situation | MindEase UX |
|---|---|
| AI unavailable | "Support analysis is temporarily unavailable. Your private journal remains available." |
| Offline | "You're offline. Your private draft has been saved locally." |
| Empty community | "No posts yet. Be the first to share something." |
| No alerts | "No support alerts requiring review." |
| Sensitive action | Re-authentication or explicit confirmation |

Plus: session timeout handling, secure logout, privacy indicators, explicit
consent confirmation, minimal sensitive data in notifications.

## 20. MVP priorities

**Student P0:** privacy-first onboarding, anonymous community, post + reply,
moderation flow, daily mood/check-in, private journal, support indicator,
counselling opt-in, crisis/help screen.
**Counsellor P0:** dashboard, anonymized alert queue, alert detail, human review
actions, opt-in case, appointment management, aggregate trends, moderation queue.

## 21. Killer demo flow

1. Open MindEase, show the privacy promise.
2. Enter anonymously, show the persistent Anonymous Mode indicator.
3. Create an anonymous post, show the moderation/review experience.
4. Complete a mood check-in and write a private journal entry.
5. Show a longitudinal support indicator with no frightening number.
6. Student picks "Talk to a counsellor" and reviews exactly what will be shared.
7. Switch to the counsellor dashboard, show an anonymized alert.
8. Open explainable indicators, demonstrate counsellor review.
9. Show the opt-in case becoming available only after consent.
10. Finish with aggregate campus trends that identify nobody.
