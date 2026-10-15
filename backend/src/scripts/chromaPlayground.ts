// Throwaway experiment for Phase R2 - run with:
//   npx tsx src/scripts/chromaPlayground.ts
// It is NOT part of the app. It shows how Chroma stores and searches text.
import { chroma, getCollection } from "../lib/chroma";
import { embedBatch, embedText } from "../lib/gemini";

const COLLECTION = "r2_playground";

async function main() {
  // Start clean so the script can be re-run and give the same output.
  await chroma.deleteCollection({ name: COLLECTION }).catch(() => {});
  const collection = await getCollection(COLLECTION);

  // 1. ADD: Gemini embeds the texts (as "document"s) and we hand Chroma the
  //    text + vector + metadata under our own ids.
  const texts = [
    "Refunds are issued to the customer within 5 business days of approval.",
    "Manager approval is required for any refund above $500.",
    "The IT help desk resets forgotten passwords after verifying identity.",
    "Insurance claims over $10,000 are escalated to a senior adjuster.",
    "Loan applications need proof of income and two forms of ID.",
  ];
  await collection.add({
    ids: ["a", "b", "c", "d", "e"],
    documents: texts,
    embeddings: await embedBatch(texts, "document"),
    metadatas: [
      { topic: "refunds" },
      { topic: "refunds" },
      { topic: "it" },
      { topic: "insurance" },
      { topic: "loans" },
    ],
  });
  console.log("Stored:", await collection.count(), "chunks\n");

  // 2. QUERY: the question is embedded by Gemini too (as a "query"), then Chroma returns
  //    the nearest stored vectors. Smaller distance = closer in meaning.
  //    Note the question shares almost no words with the best match.
  for (const q of [
    "How long until a customer gets their money back?",
    "I can't log in, what should I do?",
    "What's the weather on Mars?", // unrelated - watch the distances
  ]) {
    const res = await collection.query({ queryEmbeddings: [await embedText(q)], nResults: 2 });
    console.log(`Q: ${q}`);
    res.documents[0].forEach((doc, i) => {
      console.log(`  ${res.distances![0][i]!.toFixed(3)}  ${doc}`);
    });
    console.log();
  }

  // 3. FILTER: metadata `where` narrows the search before ranking. In R6 this
  //    is how we will restrict results to one dataset's documents.
  const filtered = await collection.query({
    queryEmbeddings: [await embedText("approval rules")],
    nResults: 2,
    where: { topic: "refunds" },
  });
  console.log("Filtered to topic=refunds:", filtered.documents[0]);

  await chroma.deleteCollection({ name: COLLECTION });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
