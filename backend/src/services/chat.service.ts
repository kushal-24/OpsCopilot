import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";
import apiError from "../utils/apiError.js";
import { runAgentTurn, ChatHistoryEntry, ToolCallRecord } from "../lib/gemini";
import { getCurrentDataset } from "./dataset.service";
import {
  MAX_CHAT_SESSIONS_PER_USER,
  GEMINI_INPUT_COST_PER_MILLION_TOKENS,
  GEMINI_OUTPUT_COST_PER_MILLION_TOKENS,
} from "../config/constants";

// ToolCallRecord.result/args are `unknown`/loosely-typed at the call site,
// but always JSON-serializable in practice (tool results are plain data
// from analytics.service.ts) — asserted here so Prisma's Json input type
// (which requires JSON-serializable values, not `unknown`) is satisfied.
function toJsonInput(toolCalls: ToolCallRecord[]): Prisma.InputJsonValue | undefined {
  return toolCalls.length > 0 ? (toolCalls as unknown as Prisma.InputJsonValue) : undefined;
}

function estimateCost(inputTokens: number, outputTokens: number): number {
  const cost =
    (inputTokens / 1_000_000) * GEMINI_INPUT_COST_PER_MILLION_TOKENS +
    (outputTokens / 1_000_000) * GEMINI_OUTPUT_COST_PER_MILLION_TOKENS;

  return Math.round(cost * 1e6) / 1e6;
}

async function enforceSessionCap(userId: string) {
  const sessions = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const excess = sessions.length - MAX_CHAT_SESSIONS_PER_USER;

  if (excess > 0) {
    const oldestIds = sessions.slice(0, excess).map((s) => s.id);

    // Cascades to ChatMessage / AIRequest per schema.prisma relations.
    await prisma.chatSession.deleteMany({ where: { id: { in: oldestIds } } });
  }
}

export async function createSession(userId: string, title?: string) {
  const dataset = await getCurrentDataset(userId);

  if (!dataset) {
    throw new apiError(400, "Upload a dataset or use the demo dataset before starting a chat");
  }

  const session = await prisma.chatSession.create({
    data: {
      userId,
      datasetId: dataset.id,
      title: title?.trim() || "New chat",
    },
  });

  await enforceSessionCap(userId);

  return session;
}

export async function listSessions(userId: string) {
  return prisma.chatSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: MAX_CHAT_SESSIONS_PER_USER,
  });
}

async function assertSessionOwnership(sessionId: string, userId: string) {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== userId) {
    throw new apiError(404, "Chat session not found");
  }

  return session;
}

export async function getSessionMessages(sessionId: string, userId: string) {
  await assertSessionOwnership(sessionId, userId);

  return prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
}

export async function sendMessage(
  sessionId: string,
  userId: string,
  content: string
) {
  const session = await assertSessionOwnership(sessionId, userId);

  const priorMessages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  const history: ChatHistoryEntry[] = priorMessages.map((message) => ({
    role: message.role === "user" ? "user" : "model",
    content: message.content,
  }));

  const userMessage = await prisma.chatMessage.create({
    data: { sessionId, role: "user", content },
  });

  const startedAt = Date.now();

  try {
    const { text, toolCalls, inputTokens, outputTokens } = await runAgentTurn(
      history,
      content,
      { datasetId: session.datasetId },
    );

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "model",
        content: text,
        toolCalls: toJsonInput(toolCalls),
      },
    });

    await prisma.aIRequest.create({
      data: {
        userId,
        datasetId: session.datasetId,
        sessionId,
        question: content,
        response: text,
        latencyMs: Date.now() - startedAt,
        inputTokens,
        outputTokens,
        estimatedCost: estimateCost(inputTokens, outputTokens),
        toolCalls: toJsonInput(toolCalls),
        success: true,
      },
    });

    return { userMessage, assistantMessage };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Agent request failed";

    await prisma.aIRequest.create({
      data: {
        userId,
        datasetId: session.datasetId,
        sessionId,
        question: content,
        latencyMs: Date.now() - startedAt,
        success: false,
        error: errorMessage,
      },
    });

    throw err;
  }
}

export async function deleteSession(sessionId: string, userId: string) {
  await assertSessionOwnership(sessionId, userId);

  await prisma.chatSession.delete({ where: { id: sessionId } });
}
