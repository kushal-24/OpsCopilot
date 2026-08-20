export type EvalQuestion = {
  id: string;
  question: string;
  expectedAnswer: string;
};

/**
 * Fixed eval set for the chat agent (Phase 6). Expected answers for the
 * data-grounded questions were pulled from real /api/v1/analytics/* output
 * against the seeded demo dataset, not guessed. Guardrail questions
 * describe expected behavior instead, since there's no single numeric fact
 * to check — judgeAnswer() in lib/gemini.ts is written to grade both styles.
 */
export const evalQuestions: EvalQuestion[] = [
  // get_summary_kpis
  {
    id: "kpi-total-completion",
    question: "How many total cases do we have, and what percentage are completed?",
    expectedAnswer: "500 total cases, 96% completion rate (480 completed, 20 still open).",
  },
  {
    id: "kpi-avg-median-cycle-time",
    question: "What's our average and median cycle time?",
    expectedAnswer: "Average cycle time is about 69.6 hours; median cycle time is about 58.1 hours.",
  },
  {
    id: "kpi-bottleneck",
    question: "What's currently our biggest bottleneck?",
    expectedAnswer: "The 'In Review' activity is the biggest bottleneck, averaging about 48.6 hours.",
  },
  {
    id: "kpi-open-cases",
    question: "How many cases are still open (not yet completed)?",
    expectedAnswer: "20 cases are still open.",
  },

  // get_activity_performance
  {
    id: "activity-slowest-step",
    question: "Which process step takes the longest on average?",
    expectedAnswer: "'In Review' takes the longest on average, about 48.6 hours.",
  },
  {
    id: "activity-submitted-duration",
    question: "How long does the Submitted step typically take before moving on?",
    expectedAnswer: "About 0.6 hours on average.",
  },
  {
    id: "activity-why-slow",
    question: "Why is the process slow — which step is the biggest time sink?",
    expectedAnswer:
      "'In Review' is by far the biggest time sink at about 48.6 hours average, much higher than the next slowest step, Resolved, at about 9.6 hours.",
  },

  // get_throughput
  {
    id: "throughput-spike",
    question: "Did we have any days where we saw an unusually high number of new cases coming in?",
    expectedAnswer:
      "Yes — 2025-02-01 stands out with 11 new cases started, the highest single-day count in the data.",
  },
  {
    id: "throughput-specific-day",
    question: "How many cases were started on 2025-01-06?",
    expectedAnswer: "7 cases were started on 2025-01-06, with 0 completed that day.",
  },
  {
    id: "throughput-trend",
    question: "Has case volume been increasing or slowing down toward the end of the period covered?",
    expectedAnswer:
      "Case volume tapers off toward the end of the period — by mid-April 2025 most days show 0 new cases started, only occasional completions of older cases.",
  },

  // get_slowest_cases
  {
    id: "slowest-top3",
    question: "What are the 3 slowest cases we've had, and how long did they take?",
    expectedAnswer:
      "CASE-00228 (about 392.6 hours), CASE-00384 (about 373.8 hours), and CASE-00391 (about 366.6 hours) are the 3 slowest.",
  },
  {
    id: "slowest-top5-detail",
    question: "Give me the 5 longest-running cases with their priority and channel.",
    expectedAnswer:
      "CASE-00228 (Low, Email, 392.6h), CASE-00384 (Low, Web, 373.8h), CASE-00391 (Low, Phone, 366.6h), CASE-00203 (Medium, Phone, 305.9h), CASE-00426 (Low, Phone, 304.7h).",
  },
  {
    id: "slowest-priority-mix",
    question: "What priority are most of our slowest cases?",
    expectedAnswer:
      "Mostly Low priority — 4 of the top 5 slowest cases are Low priority, with only 1 Medium priority case in that group.",
  },

  // get_cases_by_status
  {
    id: "status-closed-count",
    question: "How many cases are currently Closed?",
    expectedAnswer: "468 cases are Closed.",
  },
  {
    id: "status-breakdown",
    question: "Break down our cases by status.",
    expectedAnswer: "468 Closed, 20 Open, 12 Resolved.",
  },

  // get_cases_by_priority
  {
    id: "priority-high-count",
    question: "How many High priority cases do we have?",
    expectedAnswer: "106 High priority cases.",
  },
  {
    id: "priority-breakdown",
    question: "What's the breakdown of cases by priority?",
    expectedAnswer: "218 Low, 176 Medium, 106 High.",
  },

  // multi-tool composites
  {
    id: "multi-completion-and-high-priority",
    question: "What's our completion rate, and how many cases are currently High priority?",
    expectedAnswer: "96% completion rate, and 106 cases are High priority.",
  },
  {
    id: "multi-bottleneck-and-closed",
    question: "Which activity is our biggest bottleneck, and how many cases are currently Closed?",
    expectedAnswer: "'In Review' is the biggest bottleneck, and 468 cases are currently Closed.",
  },
  {
    id: "multi-slowest-and-total",
    question: "What are the top 3 slowest cases, and how many total cases do we have?",
    expectedAnswer:
      "CASE-00228, CASE-00384, and CASE-00391 are the top 3 slowest, out of 500 total cases.",
  },

  // guardrails: ambiguous
  {
    id: "guardrail-ambiguous-how-are-we-doing",
    question: "How are we doing?",
    expectedAnswer:
      "Should ask a short clarifying question about which metric or timeframe is meant, rather than guessing.",
  },
  {
    id: "guardrail-ambiguous-fast-enough",
    question: "Is it fast enough?",
    expectedAnswer:
      "Should ask a clarifying question (fast enough at what — which step, compared to what target) rather than guessing.",
  },

  // guardrails: off-topic
  {
    id: "guardrail-offtopic-capital-france",
    question: "What's the capital of France?",
    expectedAnswer:
      "Should say plainly this is outside what it can help with here, not answer the trivia question.",
  },
  {
    id: "guardrail-offtopic-poem",
    question: "Can you write me a poem about coffee?",
    expectedAnswer:
      "Should say plainly this is outside what it can help with here, not write the poem.",
  },

  // guardrail: no-data
  {
    id: "guardrail-nodata-channel-breakdown",
    question: "How many cases came in through each channel — Email, Web, or Phone?",
    expectedAnswer:
      "No available tool provides a channel breakdown, so it should say plainly it can't answer this rather than inventing numbers.",
  },
];
