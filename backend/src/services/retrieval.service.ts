import { getCollection } from "../lib/chroma";
import { embedText } from "../lib/gemini";
import {
  SOP_COLLECTION,
  SOP_MAX_DISTANCE,
  SOP_SEARCH_TOP_K,
} from "../config/constants";

export type SopMatch = {
  text: string;
  documentId: string;
  documentName: string;
  section: string;
  // Smaller = closer in meaning. Kept so the trust panel can show relevance.
  distance: number;
};

/**
 * Search one dataset's SOP chunks by meaning.
 *  1. Embed the question with the SAME model as the chunks (as a "query").
 *  2. Ask Chroma for the nearest chunks - but ONLY among chunks whose
 *     `datasetId` label matches. This filter is the access control: it is
 *     what stops one user's question from returning another user's SOPs.
 *  3. Drop matches farther than SOP_MAX_DISTANCE, so an unrelated question
 *     returns an empty list instead of the "least bad" chunks.
 */
export async function searchSops(
  datasetId: string,
  question: string,
  topK: number = SOP_SEARCH_TOP_K,
  maxDistance: number = SOP_MAX_DISTANCE,
): Promise<SopMatch[]> {
  const queryVector = await embedText(question, "query");
  const collection = await getCollection(SOP_COLLECTION);

  const result = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: topK,
    where: { datasetId },
  });

  const documents = result.documents[0] ?? [];
  const metadatas = result.metadatas[0] ?? [];
  const distances = result.distances?.[0] ?? [];

  const matches: SopMatch[] = [];
  documents.forEach((text, i) => {
    const meta = metadatas[i] ?? {};
    const distance = distances[i] ?? Infinity;
    if (!text || distance > maxDistance) return;

    matches.push({
      text,
      documentId: String(meta.documentId ?? ""),
      documentName: String(meta.documentName ?? ""),
      section: String(meta.section ?? ""),
      distance,
    });
  });
  return matches;
}
