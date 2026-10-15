import "dotenv/config";
import { ChromaClient } from "chromadb";

// One shared client for the whole app (same idea as lib/prisma.ts).
// CHROMA_URL is http://chroma:8000 inside Docker and http://localhost:8000
// when the backend runs directly on your machine.
const url = new URL(process.env.CHROMA_URL ?? "http://localhost:8000");

export const chroma = new ChromaClient({
  host: url.hostname,
  port: Number(url.port || 8000),
  ssl: url.protocol === "https:",
});

// A "collection" in Chroma is like a table: a named set of chunks + vectors.
// getOrCreateCollection is idempotent - safe to call on every request.
// embeddingFunction: null tells Chroma NOT to embed anything itself. We make
// the vectors with Gemini (lib/gemini.ts) and pass them in explicitly, so the
// same model is guaranteed for documents and questions.
export async function getCollection(name: string) {
  return chroma.getOrCreateCollection({ name, embeddingFunction: null });
}
