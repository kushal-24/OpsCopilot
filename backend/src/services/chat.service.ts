import { prisma } from "../lib/prisma";
import apiError from "../utils/apiError.js";
import { runAgentTurn, ChatHistoryEntry } from "../lib/gemini";
import {
  SEEDED_DATASET_ID,
  MAX_CHAT_SESSIONS_PER_USER,
  GEMINI_INPUT_COST_PER_MILLION_TOKENS,
  GEMINI_OUTPUT_COST_PER_MILLION_TOKENS,
} from "../config/constants";

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
  const session = await prisma.chatSession.create({
    data: {
      userId,
      // TODO(RAG): pin to a real user-selected dataset once RAG/dataset
      // upload wiring lands — every session is pinned to the demo dataset
      // until then.
      datasetId: SEEDED_DATASET_ID,
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
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
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
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
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
