import { prisma } from "../lib/prisma";

const MS_PER_HOUR = 1000 * 60 * 60;

// A case is finished once its latest event lands in one of these statuses.
const COMPLETED_STATUSES = new Set(["Resolved", "Closed"]);

type EventRow = {
  activity: string;
  timestamp: Date;
  status: string;
  resource: string;
};

type CaseTimeline = {
  caseId: string;
  priority: string;
  channel: string;
  customerType: string;
  createdAt: Date;
  events: EventRow[];
};

/**
 * Single read of the event log. Every metric below is computed from this
 * in-memory shape, so the dashboard endpoint hits the DB once instead of
 * once per metric.
 */

//fetches all cases from the cases table and ascending order me its list of events
//Promise<CaseTimeline[]> → function returns a Promise that resolves to an array of CaseTimeline.
async function loadCaseTimelines(datasetId?: string): Promise<CaseTimeline[]> {
  return prisma.case.findMany({
    where: datasetId ? { datasetId } : undefined,
    include: {
      events: { orderBy: { timestamp: "asc" } },
    },
  });
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

//Gets the latest event of a case.
function lastEvent(caseTimeline: CaseTimeline): EventRow | undefined {
  return caseTimeline.events[caseTimeline.events.length - 1];
}

//to Check whether the case's latest event has status Resolved or Closed.
function isCompleted(caseTimeline: CaseTimeline): boolean {
  const latest = lastEvent(caseTimeline);
  return latest ? COMPLETED_STATUSES.has(latest.status) : false;
}

/** Wall-clock hours from case creation to its latest event. */
function durationHours(caseTimeline: CaseTimeline): number | null {
  const latest = lastEvent(caseTimeline);
  if (!latest) return null;

  return (
    (latest.timestamp.getTime() - caseTimeline.createdAt.getTime()) / MS_PER_HOUR
  );
}

//[...values] → creates a copy of values using the spread operator.
function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Average hours a case waits in each activity before moving to the next one.
 * Terminal activities never appear here — they have no following event.
 */
function computeActivityPerformance(cases: CaseTimeline[]) {
  const activityData = new Map<
    string,
    { totalDuration: number; count: number }
  >();

  for (const caseTimeline of cases) {
    const events = caseTimeline.events;

    for (let i = 0; i < events.length - 1; i++) {
      const current = events[i];
      const next = events[i + 1];
      const waited = next.timestamp.getTime() - current.timestamp.getTime();

      const data = activityData.get(current.activity) ?? {
        totalDuration: 0,
        count: 0,
      }; // ?? means if left side is null use the right side default object

      data.totalDuration += waited;
      data.count++;
      activityData.set(current.activity, data);
    }
  }

  return Array.from(activityData.entries())
    .map(([activity, data]) => ({
      activity,
      avgDurationHours: round2(data.totalDuration / data.count / MS_PER_HOUR),
      occurrences: data.count,
    }))
    .sort((a, b) => b.avgDurationHours - a.avgDurationHours);
}

/**
 * Cases started vs completed per calendar day. Days with no activity are
 * filled with zeroes so a line chart renders a continuous series.
 */
function computeThroughput(cases: CaseTimeline[]) {
  const started = new Map<string, number>();
  const completed = new Map<string, number>();

  for (const caseTimeline of cases) {
    const startKey = toDateKey(caseTimeline.createdAt);
    started.set(startKey, (started.get(startKey) ?? 0) + 1);

    if (!isCompleted(caseTimeline)) continue;

    const endKey = toDateKey(lastEvent(caseTimeline)!.timestamp);
    completed.set(endKey, (completed.get(endKey) ?? 0) + 1);
  }

  const allKeys = [...started.keys(), ...completed.keys()].sort();
  if (allKeys.length === 0) return [];

  const series: { date: string; startedCases: number; completedCases: number }[] =
    [];
  const cursor = new Date(`${allKeys[0]}T00:00:00.000Z`);
  const lastDay = new Date(`${allKeys[allKeys.length - 1]}T00:00:00.000Z`);

  while (cursor <= lastDay) {
    const key = toDateKey(cursor);

    series.push({
      date: key,
      startedCases: started.get(key) ?? 0,
      completedCases: completed.get(key) ?? 0,
    });

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return series;
}

/** Flat rows, ready to drop straight into a table. */
function computeSlowestCases(cases: CaseTimeline[], limit: number) {
  return cases
    .map((caseTimeline) => {
      const latest = lastEvent(caseTimeline);
      const hours = durationHours(caseTimeline);

      return {
        caseId: caseTimeline.caseId,
        priority: caseTimeline.priority,
        channel: caseTimeline.channel,
        customerType: caseTimeline.customerType,
        durationHours: hours === null ? 0 : round2(hours),
        steps: caseTimeline.events.length,
        currentActivity: latest?.activity ?? null,
        status: latest?.status ?? null,
        isCompleted: isCompleted(caseTimeline),
      };
    })
    .sort((a, b) => b.durationHours - a.durationHours)
    .slice(0, limit);
}

//Groups cases by a given field and counts each group → { [label]: value, count }[]
function countBy<K extends string>(
  cases: CaseTimeline[],
  key: (caseTimeline: CaseTimeline) => string | null,
  label: K
) {
  const counts = new Map<string, number>();

  for (const caseTimeline of cases) {
    const value = key(caseTimeline);
    if (value === null) continue;

    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ [label]: value, count } as Record<K, string> & {
      count: number;
    }))
    .sort((a, b) => b.count - a.count);
}

function computeKpis(cases: CaseTimeline[], activityPerformance: ReturnType<typeof computeActivityPerformance>) {
  const totalCases = cases.length;
  const totalEvents = cases.reduce((sum, c) => sum + c.events.length, 0);

  // Cycle time only means something for cases that actually finished.
  const completedDurations = cases
    .filter(isCompleted)
    .map(durationHours)
    .filter((hours): hours is number => hours !== null);

  const avgCycleTimeHours =
    completedDurations.length > 0
      ? completedDurations.reduce((sum, hours) => sum + hours, 0) /
        completedDurations.length
      : 0;

  const bottleneck = activityPerformance[0] ?? null;

  return {
    totalCases,
    totalEvents,
    completedCases: completedDurations.length,
    openCases: totalCases - completedDurations.length,
    completionRate:
      totalCases > 0 ? round2((completedDurations.length / totalCases) * 100) : 0,
    avgCycleTimeHours: round2(avgCycleTimeHours),
    medianCycleTimeHours: round2(median(completedDurations)),
    bottleneckActivity: bottleneck?.activity ?? null,
    bottleneckAvgDurationHours: bottleneck?.avgDurationHours ?? null,
  };
}

export async function getSummary(datasetId?: string) {
  const cases = await loadCaseTimelines(datasetId);

  return computeKpis(cases, computeActivityPerformance(cases));
}

export async function getActivityPerformance(datasetId?: string) {
  return computeActivityPerformance(await loadCaseTimelines(datasetId));
}

//Counts cases started/completed for each calendar day → { date, startedCases, completedCases }[]
export async function getThroughput(datasetId?: string) {
  return computeThroughput(await loadCaseTimelines(datasetId));
}

//Finds and returns the longest-running cases → case-detail objects []
export async function getSlowestCases(datasetId?: string, limit = 10) {
  return computeSlowestCases(await loadCaseTimelines(datasetId), limit);
}

export async function getCasesByStatus(datasetId?: string) {
  const cases = await loadCaseTimelines(datasetId);

  return countBy(cases, (c) => lastEvent(c)?.status ?? null, "status");
}

export async function getCasesByPriority(datasetId?: string) {
  const cases = await loadCaseTimelines(datasetId);

  return countBy(cases, (c) => c.priority, "priority");
}

/**
 * Everything the dashboard page needs, from a single DB read.
 */
export async function getDashboard(datasetId?: string, slowestLimit = 10) {
  const cases = await loadCaseTimelines(datasetId);
  const activityPerformance = computeActivityPerformance(cases);

  return {
    kpis: computeKpis(cases, activityPerformance),
    activityPerformance,
    throughput: computeThroughput(cases),
    slowestCases: computeSlowestCases(cases, slowestLimit),
    statusBreakdown: countBy(cases, (c) => lastEvent(c)?.status ?? null, "status"),
    priorityBreakdown: countBy(cases, (c) => c.priority, "priority"),
  };
}
