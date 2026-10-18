// Debug tool for Phase R6 - see exactly what a question retrieves:
//   npx tsx src/scripts/searchSops.ts <datasetId> "your question"
import { prisma } from "../lib/prisma";
import { searchSops } from "../services/retrieval.service";

const [datasetId, ...rest] = process.argv.slice(2);
const question = rest.join(" ");
if (!datasetId || !question) {
  console.error('Usage: searchSops.ts <datasetId> "question"');
  process.exit(1);
}

searchSops(datasetId, question)
  .then((matches) => {
    if (matches.length === 0) console.log("No relevant SOP content found.");
    for (const m of matches) {
      console.log(`${m.distance.toFixed(3)}  ${m.documentName} / ${m.section}`);
    }
  })
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
