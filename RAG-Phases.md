# RAG (SOP Documents) Implementation Phases

> Goal: a manager uploads SOP documents, and the chat copilot can answer policy questions from them ("What's our refund approval SLA?") and compare them with real data ("Approvals take 4.2 days, but the SOP says 2").
>
> Each phase ends with something you can **run and see**. We pause after each phase so you can understand it before moving on. Vector store: **Chroma** (separate container). Embeddings and LLM: **Gemini**.

## The big picture

```
INGESTION (once per upload)
  SOP file -> extract text -> chunk -> embed (Gemini) -> store in Chroma
                                  \-> Document row in Postgres

QUERY (every chat question)
  question -> Gemini decides to call search_docs -> embed question
           -> Chroma returns top-k chunks -> chunks go back to Gemini (augment)
           -> Gemini writes the answer (generate) -> trust panel shows sources
```

**Where things live**
- Postgres: the `Document` row (name, file, dataset). Source of truth for "which documents exist".
- Chroma: chunk text + vector + metadata (`documentId`, `datasetId`, chunk index, section).

---

## PHASE R1: Concepts + Chroma container

**Learn:** what an embedding is, why we search by meaning instead of keywords, what a vector DB does.

- [x] Add a `chroma` service and a `chroma_data` volume to `docker-compose.yml`
- [x] Add `CHROMA_URL` to the backend environment and `depends_on: chroma`
- [x] Start the stack and check that the Chroma heartbeat endpoint responds
- [x] Confirm the backend container can reach `http://chroma:8000`

**Done when:** `docker compose up` brings up four containers, and the backend can reach Chroma.

---

## PHASE R2: Chroma hands-on (standalone experiment)

**Learn:** the Chroma API (collections, add, query) with no app code involved.

- [x] Install the `chromadb` npm client in the backend
- [x] Create `lib/chroma.ts`: one shared client and a `getCollection()` helper
- [x] Write a throwaway script: add 5 short sentences, query "how long do refunds take?", print the nearest ones
- [x] Observe distances: relevant results are close, unrelated ones are far

**Done when:** you can see a meaning-based search work on a tiny hand-made example.

---

## PHASE R3: Embeddings with Gemini

**Learn:** turning text into vectors, and why the same model must embed both the documents and the questions.

- [x] Add `embedText()` and `embedBatch()` to `lib/gemini.ts` (embedding model, fixed output dimension)
- [x] Choose and record the embedding model and dimension in `config/constants.ts`
- [x] Re-run the R2 experiment using real Gemini embeddings instead of Chroma's defaults
- [x] Handle rate limits and errors (retry, batch size)

**Done when:** the R2 experiment works with Gemini vectors, and you understand why the model name is a constant.

---

## PHASE R4: Chunking

**Learn:** why we split documents, and how chunk size and overlap affect retrieval quality.

- [x] Write 5-10 realistic SOP files (`backend/data/sops/*.md`) matched to the four demo datasets (refunds, insurance claims, IT service desk, loans)
- [x] Write `services/chunking.service.ts`: split by headings and paragraphs, target about 500-800 characters, about 100 overlap
- [x] Attach metadata to each chunk: document name, section title, chunk index
- [x] Print the chunks for one SOP and review them by eye. Are the boundaries sensible?

**Done when:** every SOP turns into clean, self-contained chunks with metadata.

---

## PHASE R5: Ingestion pipeline (upload -> Chroma)

**Learn:** how the Postgres row and the Chroma chunks are tied together.

- [x] Extend the `Document` model (additive migration only): `status` (processing / ready / failed), `chunkCount`. Existing models stay untouched.
- [x] `services/document.service.ts`: save the file, extract text, chunk, embed, upsert into Chroma
- [x] Use stable chunk IDs (`documentId:index`) and store `documentId` and `datasetId` as metadata
- [x] Endpoints in `routes/document.routes.ts` (auth required): `POST /documents` (upload), `GET /documents` (list), `DELETE /documents/:id`
- [x] Delete removes the Postgres row **and** the Chroma chunks (filter by `documentId`)
- [x] Deleting a dataset or user must also clean their chunks from Chroma
- [x] Seed script: ingest the bundled SOPs for the demo datasets

**Done when:** uploading a file creates a row and chunks, and deleting it removes both.

---

## PHASE R6: Search (retrieval)

**Learn:** top-k, distance scores, and metadata filtering (access control).

- [x] `services/retrieval.service.ts`: embed the query, query Chroma with `where: { datasetId }`, return top-k chunks with source and score
- [x] Add a minimum-relevance cutoff so unrelated questions return "nothing found" instead of garbage
- [x] Temporary debug endpoint or script: ask a question, see the retrieved chunks
- [x] Verify dataset isolation: user A's question never returns user B's chunks

**Done when:** a policy question returns the right chunks, and an unrelated question returns none.

---

## PHASE R7: Augment + Generate (agent tool)

**Learn:** how tool-calling does the "augment" step, and how grounding prevents made-up answers.

- [x] Add a `search_docs` tool definition to `tools/` (name, description, parameter `query`)
- [x] Register it with the chat agent next to the analytics tools; handle the call in `chat.service.ts`
- [x] Update the system prompt: use `search_docs` for policy/SOP questions, cite the source document, and say so if the SOPs don't cover it
- [x] Store the tool call and its results in `toolCalls` (same shape as the existing tools)
- [x] Test mixed questions: "Is our approval time within the SOP target?" (needs both SQL and SOP)

**Done when:** chat answers SOP questions from the documents and cites them.

---

## PHASE R8: Frontend

**Learn:** how the UI surfaces retrieval, so the trust panel makes RAG visible.

- [x] Documents UI at the existing `/document` placeholder: upload zone, list with status, delete (reuse the Data page components' style)
- [x] `api/documents.api.js` plus TanStack Query hooks
- [x] Trust panel: render `search_docs` results as source name + passage excerpt (in addition to SQL and metrics)
- [x] Add the nav item and empty/loading/error states

**Done when:** you can upload an SOP in the browser, ask about it in chat, and expand the panel to see the passages used.

---

## PHASE R9: Evaluate + document

**Learn:** how to measure RAG quality.

- [ ] Add ~8 SOP questions with expected answers to `config/evalQuestions.ts`
- [ ] Run the eval and read failures. Is it a retrieval miss (wrong chunks) or a generation miss?
- [ ] Tune chunk size, overlap and top-k using the eval results
- [ ] Update README: RAG architecture, Chroma container, and the QCD trade-offs (why Chroma, why raw tool-calling)

**Done when:** the eval set shows SOP questions passing, and the README explains the RAG flow.

---

## Safety rules for every phase

- Migrations are **additive only**; no existing table or column changes or drops.
- Existing chat, dashboard, evals and auth keep working after each phase (type-check and build before moving on).
- Chunks always carry `datasetId`; every search filters on it.
- One embedding model for documents and queries. If it changes, everything is re-ingested.
