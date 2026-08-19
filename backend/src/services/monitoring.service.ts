import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";

type RequestRow = {
  createdAt: Date;
  latencyMs: number | null;
  estimatedCost: number | null;
  success: boolean;
};

/**
 * Single read of the AI request log. Summary stats and both time-series
 * are computed from this in-memory shape, so the overview endpoint hits
 * the DB once instead of once per metric — same pattern as analytics.service.ts.
 */
async function loadRequests(datasetId?: string): Promise<RequestRow[]> {
  return prisma.aIRequest.findMany({
    where: datasetId ? { datasetId } : undefined,
    select: { createdAt: true, latencyMs: true, estimatedCost: true, success: true },
    orderBy: { createdAt: "asc" },
  });
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundCost(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function computeSummary(requests: RequestRow[]) {
  const totalRequests = requests.length;
  const errorCount = requests.filter((r) => !r.success).length;

  const latencies = requests
    .map((r) => r.latencyMs)
    .filter((v): v is number => v !== null);

  const avgLatencyMs =
    latencies.length > 0
      ? round2(latencies.reduce((sum, v) => sum + v, 0) / latencies.length)
      : 0;

  const totalCost = roundCost(
    requests.reduce((sum, r) => sum + (r.estimatedCost ?? 0), 0)
  );

  const errorRate =
    totalRequests > 0 ? round2((errorCount / totalRequests) * 100) : 0;

  return { totalRequests, avgLatencyMs, totalCost, errorRate };
}

/** Average latency per calendar day. Days with no requests are omitted. */
function computeLatencyOverTime(requests: RequestRow[]) {
  const byDay = new Map<string, { sum: number; count: number }>();

  for (const r of requests) {
    if (r.latencyMs === null) continue;

    const key = toDateKey(r.createdAt);
    const entry = byDay.get(key) ?? { sum: 0, count: 0 };
    entry.sum += r.latencyMs;
    entry.count++;
    byDay.set(key, entry);
  }

  return Array.from(byDay.entries())
    .map(([date, entry]) => ({
      date,
      avgLatencyMs: round2(entry.sum / entry.count),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Total/success/error request counts per calendar day. */
function computeRequestVolumeOverTime(requests: RequestRow[]) {
  const byDay = new Map<string, { total: number; success: number; error: number }>();

  for (const r of requests) {
    const key = toDateKey(r.createdAt);
    const entry = byDay.get(key) ?? { total: 0, success: 0, error: 0 };
    entry.total++;
    if (r.success) entry.success++;
    else entry.error++;
    byDay.set(key, entry);
  }

  return Array.from(byDay.entries())
    .map(([date, entry]) => ({
      date,
      totalRequests: entry.total,
      successCount: entry.success,
      errorCount: entry.error,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getSummary(datasetId?: string) {
  return computeSummary(await loadRequests(datasetId));
}

export async function getLatencyOverTime(datasetId?: string) {
  return computeLatencyOverTime(await loadRequests(datasetId));
}

export async function getRequestVolumeOverTime(datasetId?: string) {
  return computeRequestVolumeOverTime(await loadRequests(datasetId));
}

/**
 * Everything the monitoring page needs, from a single DB read.
 */
export async function getOverview(datasetId?: string) {
  const requests = await loadRequests(datasetId);

  return {
    summary: computeSummary(requests),
    latencyOverTime: computeLatencyOverTime(requests),
    requestVolumeOverTime: computeRequestVolumeOverTime(requests),
  };
}

export type RequestLogStatus = "success" | "error";

export type RequestLogFilters = {
  datasetId?: string;
  status?: RequestLogStatus;
  page: number;
  pageSize: number;
};

/** Paginated raw request log for the future monitoring table. */
export async function getRequestLog(filters: RequestLogFilters) {
  const where: Prisma.AIRequestWhereInput = {};

  if (filters.datasetId) where.datasetId = filters.datasetId;
  if (filters.status === "success") where.success = true;
  if (filters.status === "error") where.success = false;

  const [total, rows] = await Promise.all([
    prisma.aIRequest.count({ where }),
    prisma.aIRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      select: {
        id: true,
        createdAt: true,
        question: true,
        latencyMs: true,
        inputTokens: true,
        outputTokens: true,
        estimatedCost: true,
        toolCalls: true,
        success: true,
        error: true,
      },
    }),
  ]);

  return {
    rows,
    page: filters.page,
    pageSize: filters.pageSize,
    total,
    totalPages: filters.pageSize > 0 ? Math.ceil(total / filters.pageSize) : 0,
  };
}
