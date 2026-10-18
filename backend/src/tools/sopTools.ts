import { Type } from "@google/genai";
import { searchSops } from "../services/retrieval.service";
import type { AgentTool } from "./analyticsTools";

/**
 * RAG tool: lets the model look things up in the user's uploaded SOP documents.
 * Like the analytics tools, datasetId comes from the chat session on the
 * server (ctx.datasetId), never from the model's arguments - so a question can
 * only ever retrieve chunks from the session's own dataset.
 */
export const sopTools: AgentTool[] = [
  {
    name: "search_docs",
    description:
      "Search the user's uploaded SOP / policy documents (standard operating procedures, handbooks, service-level targets, approval rules, escalation and eligibility policies). Use this for any question about what the documented process, rule, target or policy IS. Returns the most relevant passages with their source document and section. Does not contain any case data - use the other tools for numbers.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description:
            "What to look up, phrased as a short self-contained search (e.g. 'manager approval time target for refunds').",
        },
      },
      required: ["query"],
    },
    execute: async (args, ctx) => {
      const query = typeof args.query === "string" ? args.query.trim() : "";
      if (!query) return { error: "query is required" };

      const matches = await searchSops(ctx.datasetId, query);

      if (matches.length === 0) {
        return {
          matches: [],
          note: "No relevant passages found in the uploaded SOPs.",
        };
      }

      return {
        matches: matches.map((m) => ({
          source: m.documentName,
          section: m.section,
          text: m.text,
          distance: Math.round(m.distance * 1000) / 1000,
        })),
      };
    },
  },
];
