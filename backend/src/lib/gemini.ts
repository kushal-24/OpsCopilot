import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  createPartFromFunctionResponse,
} from "@google/genai";
import { analyticsTools, ToolContext } from "../tools/analyticsTools";

const MODEL = "gemini-3.6-flash";
const MAX_TOOL_ROUNDS = 5;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are OpsCopilot, an assistant that helps a non-technical operations
manager understand their process/operations data. You only discuss this
operational data — you are not a general-purpose chatbot. You have tools
that query the real database — use them whenever a question depends on
actual numbers (counts, durations, bottlenecks, trends, specific cases).
Never invent or estimate a number that a tool could have given you.

Rules:
- If a question needs data, call the relevant tool(s) before answering.
- If a question is ambiguous, ask a short clarifying question instead of guessing.
- If a question is unrelated to this operational data (general knowledge, trivia, other topics), say plainly that it's outside what you can help with here — do not answer it from general knowledge.
- If no available tool can answer a data question, say so plainly instead of making something up.
- If a tool returns no data, say so plainly rather than inventing a result.
- Keep answers short, plain-English, and grounded in what the tools returned.`;

export type ChatHistoryEntry = {
  role: "user" | "model";
  content: string;
};

export type ToolCallRecord = {
  tool: string;
  args: Record<string, unknown>;
  result?: unknown;
  error?: string;
};

export type AgentReply = {
  text: string;
  toolCalls: ToolCallRecord[];
  inputTokens: number;
  outputTokens: number;
};

const toolDeclarations = analyticsTools.map((tool) => ({
  name: tool.name,
  description: tool.description,
  parameters: tool.parameters,
}));

const toolsByName = new Map(analyticsTools.map((tool) => [tool.name, tool]));

/**
 * One user turn, resolved through however many rounds of tool-calling the
 * model needs (capped). Every tool call made along the way is recorded so
 * the caller can persist it for the trust panel.
 */
export async function runAgentTurn(
  history: ChatHistoryEntry[],
  newMessage: string,
  toolContext: ToolContext,
): Promise<AgentReply> {
  const chat = ai.chats.create({
    model: MODEL,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: toolDeclarations }],
      toolConfig: {
        functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
      },
    },
    history: history.map((entry) => ({
      role: entry.role,
      parts: [{ text: entry.content }],
    })),
  });

  const toolCalls: ToolCallRecord[] = [];
  let inputTokens = 0;
  let outputTokens = 0;

  let response = await chat.sendMessage({ message: newMessage });

  const trackUsage = (res: typeof response) => {
    inputTokens += res.usageMetadata?.promptTokenCount ?? 0;
    outputTokens += res.usageMetadata?.candidatesTokenCount ?? 0;
  };

  trackUsage(response);

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const functionCalls = response.functionCalls;

    if (!functionCalls || functionCalls.length === 0) {
      return { text: response.text ?? "", toolCalls, inputTokens, outputTokens };
    }
    
    /*
    functionCalls = [
      {
        name: "getActivityPerformance",
        args: {}
      }
    ] 
    */

    const responseParts = [];

    for (const call of functionCalls) {
      const name = call.name ?? "";
      const args = call.args ?? {};
      const tool = toolsByName.get(name);

      if (!tool) {
        const error = `Unknown tool: ${name}`;
        toolCalls.push({ tool: name, args, error });
        responseParts.push(
          createPartFromFunctionResponse(call.id ?? name, name, { error }),
        );
        continue;
      }

      try {
        const result = await tool.execute(args, toolContext);
        toolCalls.push({ tool: name, args, result });
        responseParts.push(
          createPartFromFunctionResponse(call.id ?? name, name, {
            output: result,
          }),
        );
      } catch (err) {
        const error =
          err instanceof Error ? err.message : "Tool execution failed";
        toolCalls.push({ tool: name, args, error });
        responseParts.push(
          createPartFromFunctionResponse(call.id ?? name, name, { error }),
        );
      }
    }

    response = await chat.sendMessage({ message: responseParts });
    trackUsage(response);
  }

  // Hit the round cap without the model settling on a text answer — force
  // one last turn with tools disabled so it has to summarize in plain text.
  const finalResponse = await chat.sendMessage({
    message:
      "Please give your best plain-English answer now, based on the tool results so far, without calling any more tools.",
    config: {
      toolConfig: {
        functionCallingConfig: { mode: FunctionCallingConfigMode.NONE },
      },
    },
  });
  trackUsage(finalResponse);

  return { text: finalResponse.text ?? "", toolCalls, inputTokens, outputTokens };
}
