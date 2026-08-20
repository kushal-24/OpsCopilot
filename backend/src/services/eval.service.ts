import "dotenv/config";
import { fileURLToPath } from "url";
import { prisma } from "../lib/prisma";
import { runAgentTurn, judgeAnswer } from "../lib/gemini";
import { evalQuestions } from "../config/evalQuestions";
import { SEEDED_DATASET_ID } from "../config/constants";
import apiError from "../utils/apiError.js";

type EvalResultRow = {
  questionId: string;
  question: string;
  expectedAnswer: string;
  actualAnswer: string;
  pass: boolean;
  judgeReasoning: string;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Pulls the API's own suggested wait time out of a 429 error message, e.g. `"retryDelay":"29s"`. */
function extractRetryDelayMs(message: string): number | null {
  const match = message.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/);
  return match ? Math.ceil(parseFloat(match[1]) * 1000) : null;
}

/**
 * The Gemini free tier caps this model at 5 requests/minute. Each question
 * needs 1+ agent calls plus a judge call, so 429s are expected — retry a
 * few times honoring the API's own suggested delay before giving up.
 */
async function withRateLimitRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isRateLimit = message.includes("RESOURCE_EXHAUSTED") || message.includes("429");

      if (!isRateLimit || attempt === maxAttempts) throw err;

      const waitMs = (extractRetryDelayMs(message) ?? 30_000) + 2_000;
      console.log(`  rate limited, waiting ${Math.round(waitMs / 1000)}s (attempt ${attempt}/${maxAttempts})`);
      await sleep(waitMs);
    }
  }
  throw new Error("unreachable");
}

/** Computed summary — never stored, always derived from the run's results. */
function summarize(results: { pass: boolean }[]) {
  const total = results.length;
  const passedCount = results.filter((r) => r.pass).length;

  return {
    total,
    passedCount,
    failedCount: total - passedCount,
    accuracy: total > 0 ? round2((passedCount / total) * 100) : 0,
  };
}

/**
 * Runs the fixed eval set against the live chat agent, grades each answer
 * with the LLM judge, and persists one EvalRun + N EvalResult rows.
 * Run standalone: `npx tsx src/services/eval.service.ts`.
 */
async function runEval() {
  const results: EvalResultRow[] = [];

  for (let i = 0; i < evalQuestions.length; i++) {
    const q = evalQuestions[i];
    const progress = `[${i + 1}/${evalQuestions.length}]`;

    try {
      const reply = await withRateLimitRetry(() =>
        runAgentTurn([], q.question, { datasetId: SEEDED_DATASET_ID }),
      );

      const verdict = await withRateLimitRetry(() =>
        judgeAnswer(q.question, q.expectedAnswer, reply.text),
      );

      results.push({
        questionId: q.id,
        question: q.question,
        expectedAnswer: q.expectedAnswer,
        actualAnswer: reply.text,
        pass: verdict.pass,
        judgeReasoning: verdict.reasoning,
      });

      console.log(`${progress} ${verdict.pass ? "PASS" : "FAIL"} ${q.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      results.push({
        questionId: q.id,
        question: q.question,
        expectedAnswer: q.expectedAnswer,
        actualAnswer: "",
        pass: false,
        judgeReasoning: `error: ${message}`,
      });

      console.log(`${progress} ERROR ${q.id} — ${message}`);
    }
  }

  const run = await prisma.evalRun.create({
    data: {
      datasetId: SEEDED_DATASET_ID,
      results: { create: results },
    },
  });

  const summary = summarize(results);
  console.log(
    `Eval run complete: ${summary.passedCount}/${summary.total} passed (${summary.accuracy}%) — run ${run.id}`,
  );
}

export async function getLatestRun(datasetId?: string) {
  const run = await prisma.evalRun.findFirst({
    where: datasetId ? { datasetId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { results: true },
  });

  if (!run) return null;

  return { ...run, ...summarize(run.results) };
}

export async function listRuns(datasetId?: string) {
  const runs = await prisma.evalRun.findMany({
    where: datasetId ? { datasetId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { results: { select: { pass: true } } },
  });

  return runs.map(({ results, ...run }) => ({ ...run, ...summarize(results) }));
}

export async function getRunById(runId: string) {
  const run = await prisma.evalRun.findUnique({
    where: { id: runId },
    include: { results: true },
  });

  if (!run) {
    throw new apiError(404, "Eval run not found");
  }

  return { ...run, ...summarize(run.results) };
}

// Self-executes only when run directly (`npx tsx src/services/eval.service.ts`),
// not when imported by eval.controller.ts for the read functions above.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runEval()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
