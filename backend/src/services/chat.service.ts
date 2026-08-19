import { prisma } from "../lib/prisma";
import apiError from "../utils/apiError.js";
import { generateChatReply, ChatHistoryEntry } from "../lib/gemini";
import { SEEDED_DATASET_ID, MAX_CHAT_SESSIONS_PER_USER } from "../config/constants";

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
  await assertSessionOwnership(sessionId, userId);

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

  const replyText = await generateChatReply(history, content);

  const assistantMessage = await prisma.chatMessage.create({
    data: { sessionId, role: "model", content: replyText },
  });

  return { userMessage, assistantMessage };
}

export async function deleteSession(sessionId: string, userId: string) {
  await assertSessionOwnership(sessionId, userId);

  await prisma.chatSession.delete({ where: { id: sessionId } });
}
