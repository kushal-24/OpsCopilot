// The demo dataset seeded via csvImport.services.ts.
// TODO(RAG): replace with real per-user dataset selection once RAG/dataset
// upload wiring lands — every chat session is pinned to this dataset until then.
export const SEEDED_DATASET_ID = "cmsybid3x0001lpliymvmo55i";

export const MAX_CHAT_SESSIONS_PER_USER = 5;

// Standard Gemini API pricing, USD per 1M tokens. Update here if pricing changes.
export const GEMINI_INPUT_COST_PER_MILLION_TOKENS = 1.5;
export const GEMINI_OUTPUT_COST_PER_MILLION_TOKENS = 7.5;

// How long a generated dashboard insight is reused before asking the LLM
// again — avoids burning the Gemini quota on every dashboard view.
export const DASHBOARD_INSIGHT_CACHE_TTL_MS = 15 * 60 * 1000;

// RAG embeddings. The SAME model must embed both the SOP chunks and the user's
// questions - vectors from different models live in different "spaces" and
// can't be compared. If you ever change these, re-ingest every document.
export const EMBEDDING_MODEL = "gemini-embedding-001";
// gemini-embedding-001 natively outputs 3072 numbers; 768 is plenty for short
// SOP text and makes storage/search ~4x lighter.
export const EMBEDDING_DIMENSIONS = 768;
// The embedding API accepts up to 100 texts per request.
export const EMBEDDING_BATCH_SIZE = 100;

// One Chroma collection holds every SOP chunk. Which chunks a user can see is
// decided by the `datasetId` metadata filter, not by separate collections.
export const SOP_COLLECTION = "sop_chunks";

// How many chunks a search hands to the model.
export const SOP_SEARCH_TOP_K = 4;
// Chroma returns "distance" (smaller = closer in meaning). Anything farther
// than this is treated as "not in the SOPs". Calibrated on the bundled SOPs:
// on-topic questions scored 0.47-0.63, unrelated ones 0.94-1.08 - 0.8 sits in
// the gap. Re-check this if the embedding model or chunking changes.
export const SOP_MAX_DISTANCE = 0.8;
