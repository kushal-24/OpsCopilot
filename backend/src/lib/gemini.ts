import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.6-flash";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type ChatHistoryEntry = {
  role: "user" | "model";
  content: string;
};

/**
 * Single non-streaming turn: prior history + one new user message in,
 * one assistant reply out. No tool-calling / RAG wired in yet — that's
 * Copilot mode (Stage 2).
 */
export async function generateChatReply(
  history: ChatHistoryEntry[],
  newMessage: string
): Promise<string> {
  const chat = ai.chats.create({
    model: MODEL,
    history: history.map((entry) => ({
      role: entry.role,
      parts: [{ text: entry.content }],
    })),
  });

  const response = await chat.sendMessage({ message: newMessage });

  return response.text ?? "";
}
