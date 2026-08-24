/**
 * Aggregated institutional analytics.
 *
 * The rule that matters here is the aggregation threshold: any group smaller
 * than MIN_AGGREGATION is suppressed rather than displayed, because a bar of
 * height 2 in "Physics, Year 4" is not an aggregate — it is two identifiable
 * students.
 */

export const MIN_AGGREGATION = 5;

export interface ConcernRow {
  concern: string;
  count: number;
  deltaPct: number;
}

export interface GroupRow {
  group: string;
  students: number;
  topConcern: string;
  supportRequests: number;
}

/** Synthetic campus-scale figures — a prototype has no real cohort. */
export const CAMPUS_CONCERNS: ConcernRow[] = [
  { concern: "Academic stress", count: 184, deltaPct: 12 },
  { concern: "Loneliness", count: 126, deltaPct: 4 },
  { concern: "Career anxiety", count: 108, deltaPct: 19 },
  { concern: "Relationships", count: 74, deltaPct: -6 },
  { concern: "Financial stress", count: 52, deltaPct: 8 },
  { concern: "Sleep", count: 47, deltaPct: 2 },
  { concern: "Family", count: 39, deltaPct: -3 },
];

export const CONCERN_TREND: { week: string; value: number }[] = [
  { week: "Week 1", value: 21 },
  { week: "Week 2", value: 27 },
  { week: "Week 3", value: 44 },
  { week: "Week 4", value: 58 },
  { week: "Week 5", value: 49 },
  { week: "Week 6", value: 38 },
];

export const SUPPORT_DEMAND: { week: string; requests: number; sessions: number }[] = [
  { week: "Week 1", requests: 9, sessions: 7 },
  { week: "Week 2", requests: 12, sessions: 9 },
  { week: "Week 3", requests: 21, sessions: 12 },
  { week: "Week 4", requests: 26, sessions: 14 },
  { week: "Week 5", requests: 22, sessions: 16 },
  { week: "Week 6", requests: 17, sessions: 15 },
];

export const MOOD_DISTRIBUTION: { label: string; share: number }[] = [
  { label: "Great", share: 9 },
  { label: "Good", share: 24 },
  { label: "Okay", share: 38 },
  { label: "Low", share: 21 },
  { label: "Struggling", share: 8 },
];

/** Deliberately includes groups under the threshold to show suppression. */
export const DEPARTMENT_ROWS: GroupRow[] = [
  { group: "Engineering — Year 1", students: 148, topConcern: "Academic stress", supportRequests: 22 },
  { group: "Engineering — Year 2", students: 131, topConcern: "Academic stress", supportRequests: 18 },
  { group: "Commerce — Year 1", students: 96, topConcern: "Career anxiety", supportRequests: 11 },
  { group: "Arts & Humanities", students: 74, topConcern: "Loneliness", supportRequests: 9 },
  { group: "Sciences — Year 3", students: 61, topConcern: "Academic stress", supportRequests: 7 },
  { group: "Architecture — Year 5", students: 4, topConcern: "Academic stress", supportRequests: 2 },
  { group: "Performing Arts", students: 3, topConcern: "Loneliness", supportRequests: 1 },
  { group: "Exchange programme", students: 2, topConcern: "Loneliness", supportRequests: 1 },
];

export interface ThresholdResult<T> {
  visible: T[];
  suppressedCount: number;
  suppressedStudents: number;
}

export function applyThreshold(
  rows: GroupRow[],
  min = MIN_AGGREGATION,
): ThresholdResult<GroupRow> {
  const visible = rows.filter((r) => r.students >= min);
  const hidden = rows.filter((r) => r.students < min);
  return {
    visible,
    suppressedCount: hidden.length,
    suppressedStudents: hidden.reduce((s, r) => s + r.students, 0),
  };
}

export const AGGREGATION_NOTE = `Groups with fewer than ${MIN_AGGREGATION} students are suppressed. Aggregates describe support demand; they are never used to identify an individual student.`;
