import { Type } from "@google/genai";
import * as analyticsService from "../services/analytics.service";

/**
 * Tool-calling wrappers around the existing analytics.service.ts functions
 * (already built for the dashboard) — reused as-is, not reimplemented.
 * datasetId is bound server-side from the chat session, never taken from
 * the LLM's arguments, so the model can't reach outside its own dataset.
 */

export type ToolContext = {
  datasetId: string;
};

export type AgentTool = {
  name: string;
  description: string;
  parameters: {
    type: Type;
    properties?: Record<string, unknown>;
    required?: string[];
  };
  execute: (args: Record<string, unknown>, ctx: ToolContext) => Promise<unknown>;
};

const NO_PARAMS = { type: Type.OBJECT, properties: {} };

export const analyticsTools: AgentTool[] = [
  {
    name: "get_summary_kpis",
    description:
      "Overall operational KPIs: total cases, completed/open counts, completion rate, average and median cycle time (hours), and the current single biggest bottleneck activity.",
    parameters: NO_PARAMS,
    execute: async (_args, ctx) => analyticsService.getSummary(ctx.datasetId),
  },
  {
    name: "get_activity_performance",
    description:
      "Average wait time (hours) and occurrence count per process activity/step, sorted slowest-first. Use this to find bottlenecks or answer why a particular step is slow.",
    parameters: NO_PARAMS,
    execute: async (_args, ctx) =>
      analyticsService.getActivityPerformance(ctx.datasetId),
  },
  {
    name: "get_throughput",
    description:
      "Daily started-vs-completed case counts across the full date range in the data. Use this to compare time periods (e.g. this week vs last week) or spot trends and spikes.",
    parameters: NO_PARAMS,
    execute: async (_args, ctx) => analyticsService.getThroughput(ctx.datasetId),
  },
  {
    name: "get_slowest_cases",
    description:
      "The individual cases that took the longest to complete, with duration, priority, channel, customer type, current activity, and status.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: {
          type: Type.INTEGER,
          description: "How many slowest cases to return. Defaults to 10.",
        },
      },
    },
    execute: async (args, ctx) => {
      const requested = Number(args.limit);
      const limit =
        Number.isFinite(requested) && requested > 0
          ? Math.min(Math.floor(requested), 50)
          : 10;

      return analyticsService.getSlowestCases(ctx.datasetId, limit);
    },
  },
  {
    name: "get_cases_by_status",
    description: "Case counts grouped by current status (e.g. Open, Resolved, Closed).",
    parameters: NO_PARAMS,
    execute: async (_args, ctx) => analyticsService.getCasesByStatus(ctx.datasetId),
  },
  {
    name: "get_cases_by_priority",
    description: "Case counts grouped by priority (e.g. High, Medium, Low).",
    parameters: NO_PARAMS,
    execute: async (_args, ctx) => analyticsService.getCasesByPriority(ctx.datasetId),
  },
];
