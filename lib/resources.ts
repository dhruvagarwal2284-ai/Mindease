import type { Resource } from "./types";

export const RESOURCES: Resource[] = [
  {
    id: "r_exam_reset",
    title: "A 10-minute reset before an exam",
    category: "Academics",
    minutes: 10,
    summary:
      "A short breathing and grounding sequence you can run in a corridor before you walk in.",
    matches: ["Academics", "Exams", "Academic stress", "Anxiety & stress"],
    content: `When exam anxiety peaks right outside the hall, your nervous system is entering fight-or-flight mode. Your heart rate accelerates, your palms get cold, and your thoughts can begin to spiral.

Step 1: The 4-7-8 Breathing Reset
Find a quiet spot against a wall. Inhale slowly through your nose for 4 counts, hold your breath gently for 7 counts, and exhale completely through your mouth with a soft whoosh for 8 counts. Repeat this four times. This physically activates your vagus nerve and slows your heart rate.

Step 2: 5-4-3-2-1 Sensory Grounding
Acknowledge 5 things you can see around you, 4 things you can physically feel (like your feet firmly on the ground), 3 distinct sounds, 2 textures you can touch, and 1 slow breath.

Step 3: The Reality Check
Remind yourself: "My adrenaline is just energy to help me focus. One exam does not define my future, and I know more than panic is telling me right now." Walk into the exam room taking slow, steady paces.`,
  },
  {
    id: "r_study_load",
    title: "When the workload stops feeling survivable",
    category: "Academics",
    minutes: 6,
    summary:
      "Breaking an overwhelming term into the next three things, and what to ask your department for.",
    matches: ["Academics", "Exams", "Academic stress", "Career"],
    content: `When assignments, lab submissions, and revision pile up simultaneously, our brain treats the entire backlog as an immediate emergency. This paralysis often makes starting anything feel impossible.

1. The "Rule of Three" Triage
Stop looking at the entire semester syllabus. Take a blank sheet of paper and write down only the three most urgent tasks due in the next 48 hours. Put everything else completely out of sight.

2. Lower the Activation Energy
Tell yourself you will only work on the first task for exactly 15 minutes. Often, the friction is in starting, not in doing. Once momentum builds, continue if you can, or take a scheduled 5-minute break without guilt.

3. Communicating with Faculty
Course coordinators and tutors are often much more accommodating than students expect when approached early. Send a concise, professional note: "I am currently facing a heavy pile-up of deadlines and would appreciate a brief extension on [assignment] to ensure quality work."`,
  },
  {
    id: "r_sleep",
    title: "Sleep that hostel life keeps interrupting",
    category: "Sleep",
    minutes: 8,
    summary:
      "Practical adjustments for shared rooms, late labs and a phone you cannot put down.",
    matches: ["Sleep", "Hostel", "Hostel life"],
    content: `Hostel environments are notoriously hostile to deep sleep: varying roommate schedules, hallway noise, late-night tea breaks, and blue light from laptop screens.

Creating a Sleep Sanctuary
Invest in comfortable earplugs and a blackout eye mask. These small tools create sensory boundaries even when lights are on in a shared room.

Managing the "Late Night Lab" Comedown
When you leave the lab at 1 AM, your brain is still in high gear. Do not jump straight from code or circuits into bed. Spend 15 minutes listening to a calming podcast or washing your face with warm water to signal the transition.

Screen Hygiene
Keep your charging phone across the room rather than under your pillow. Doomscrolling in the dark prevents melatonin secretion and extends insomnia by hours.`,
  },
  {
    id: "r_lonely",
    title: "Feeling alone in a crowded campus",
    category: "Belonging",
    minutes: 7,
    summary:
      "Why loneliness spikes in the first and final year, and low-pressure ways back into company.",
    matches: ["Loneliness", "Relationships", "General"],
    content: `You can be surrounded by hundreds of students in a lecture hall or dining hall and still feel profoundly isolated. This is one of the most common, yet least discussed, campus experiences.

The Social Media Mirage
When you look around, everyone seems to have tight-knit friend groups. In reality, most groups are casual acquaintances, and many students are silently searching for deeper connections just like you.

Low-Stakes Social Contact
You don't need to attend crowded parties or join large clubs if that feels overwhelming. Try studying in a library or common room instead of isolating in your room, or ask a classmate to grab a chai between lectures.

Reaching Out
True belonging is built through small, repeated interactions over time. Be patient with yourself, and remember that feeling lonely is a universal transitional feeling, not a personal shortcoming.`,
  },
  {
    id: "r_panic",
    title: "Riding out a panic wave",
    category: "Anxiety",
    minutes: 5,
    summary: "What is happening in your body, and what actually shortens it.",
    matches: ["Anxiety & stress", "Exams", "Academics"],
    content: `A panic attack is intense and terrifying, but it is physically harmless and will always peak and subside within 10 to 20 minutes.

What is happening:
Your brain mistakenly activated your emergency alarm. Your rapid heart rate and shortness of breath are oxygen delivery mechanisms, not signs of physical collapse.

What to do right now:
1. Plant both feet firmly flat on the floor.
2. Place one hand on your chest and one on your stomach. Breathe so your stomach rises more than your chest.
3. Don't fight the sensations — say to yourself: "This feels uncomfortable, but I am safe. My body is riding a wave, and the wave will pass."`,
  },
  {
    id: "r_money",
    title: "Money stress and where campus help exists",
    category: "Finances",
    minutes: 9,
    summary:
      "Hardship funds, fee deferral and the conversations that are worth having early.",
    matches: ["Finances", "Financial stress", "Career"],
    content: `Financial anxiety can weigh heavily on academic performance and mental wellbeing. When you are constantly worrying about rent, mess fees, or project expenses, focusing on coursework becomes difficult.

Campus Support Mechanisms:
Most universities maintain confidential student hardship funds, fee deferral programs, and work-study opportunities. Speaking to a student welfare officer or counsellor can connect you directly with institutional aid without public disclosure.

Budgeting Realism:
Track essential costs versus discretionary spending for two weeks without judgment. Knowing your exact numbers reduces the background anxiety of uncertainty.`,
  },
  {
    id: "r_family",
    title: "Talking to family about how you are doing",
    category: "Family",
    minutes: 11,
    summary:
      "Scripts for when expectations at home and reality at college have drifted apart.",
    matches: ["Family", "Relationships", "Career"],
    content: `Family expectations often come from a place of care, but they can create immense pressure when your interests, grades, or mental health don't align with their vision.

Setting the Stage
Avoid having intense conversations during brief weekly check-in calls when emotions are already high. Choose a calm time and use "I" statements instead of accusatory phrasing.

Sample Script:
"I know how much you want me to succeed, and I want that too. Right now, the pressure is affecting my health, and I need to pace myself so I can finish sustainably. I appreciate your support while I work through this."`,
  },
  {
    id: "r_support_friend",
    title: "Supporting a friend without carrying it alone",
    category: "Peer support",
    minutes: 6,
    summary:
      "How to listen well, what not to promise, and when to bring in a counsellor.",
    matches: ["General", "Relationships", "Loneliness"],
    content: `Being a supportive friend is invaluable, but you are a peer, not a trained therapist. Protecting your own mental bandwidth is essential so both of you stay supported.

Principles of Active Listening:
- Validate their emotions before trying to solve their problems. Phrases like "That sounds really exhausting" are often much more comforting than "Here is what you should do."
- Never promise secrecy if someone expresses thoughts of self-harm or danger.
- Gently encourage professional support: "I'm always here to listen, but let's also reach out to the campus counselling team together."`,
  },
  {
    id: "r_first_session",
    title: "What a first counselling session is actually like",
    category: "Getting help",
    minutes: 4,
    summary:
      "Who is in the room, what gets written down, and what you are never obliged to say.",
    matches: ["Anxiety & stress", "Academic stress", "Something else", "General"],
    content: `Booking a first counselling appointment can feel intimidating if you don't know what to expect. Here is what actually happens:

1. A Safe, Confidential Space
Campus counselling sessions are strictly confidential. Nothing you say appears on your academic transcript or goes to your professors or parents.

2. You Set the Agenda
The counsellor will ask broad, gentle questions like "What brings you in today?" or "How have things been feeling lately?" You are in full control of what you share and at what pace.

3. Collaborative Support
Counsellors don't judge you or tell you what to do. They help you unpack thoughts, develop coping strategies, and navigate stressful academic or personal situations.`,
  },
];

export function resourceById(id: string, customResources: Resource[] = []): Resource | undefined {
  return [...customResources, ...RESOURCES].find((r) => r.id === id);
}

/** Simple, explainable matching: tag overlap, then recency-neutral ordering. */
export function recommendResources(tags: string[], limit = 3, customResources: Resource[] = []): Resource[] {
  const all = [...customResources, ...RESOURCES];
  if (!tags.length) {
    return all.filter((r) =>
      ["r_first_session", "r_lonely", "r_sleep"].includes(r.id),
    ).slice(0, limit);
  }
  const scored = all.map((r) => ({
    r,
    score: r.matches.filter((m) => tags.includes(m)).length,
  }));
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.r);
}

/* --------------------------------------------------------- crisis contacts */

export interface CrisisContact {
  id: string;
  label: string;
  detail: string;
  value: string;
  kind: "campus" | "national" | "personal";
  /** false until an administrator configures it from a verified source */
  configured: boolean;
}

/**
 * Deliberately unconfigured. A prototype must not ship invented helpline
 * numbers — the institution supplies verified contacts at deployment.
 */
export const CRISIS_CONTACTS: CrisisContact[] = [
  {
    id: "c_campus",
    label: "Campus counselling centre",
    detail: "Staffed during campus hours. Configured by your institution.",
    value: "Not configured in this prototype",
    kind: "campus",
    configured: false,
  },
  {
    id: "c_oncall",
    label: "Campus on-call warden",
    detail: "Out-of-hours first response for residential students.",
    value: "Not configured in this prototype",
    kind: "campus",
    configured: false,
  },
  {
    id: "c_national",
    label: "National crisis helpline",
    detail: "24/7 confidential support line for your region.",
    value: "Not configured in this prototype",
    kind: "national",
    configured: false,
  },
  {
    id: "c_emergency",
    label: "Emergency services",
    detail: "If someone is in immediate physical danger.",
    value: "Not configured in this prototype",
    kind: "national",
    configured: false,
  },
];
