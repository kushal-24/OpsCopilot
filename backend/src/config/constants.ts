// The demo dataset seeded via csvImport.services.ts.
// TODO(RAG): replace with real per-user dataset selection once RAG/dataset
// upload wiring lands — every chat session is pinned to this dataset until then.
export const SEEDED_DATASET_ID = "cmsybid3x0001lpliymvmo55i";

export const MAX_CHAT_SESSIONS_PER_USER = 5;

// Standard Gemini API pricing, USD per 1M tokens. Update here if pricing changes.
export const GEMINI_INPUT_COST_PER_MILLION_TOKENS = 1.5;
export const GEMINI_OUTPUT_COST_PER_MILLION_TOKENS = 7.5;
