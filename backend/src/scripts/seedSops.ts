// Ingest the bundled SOPs (data/sops/*.md) into a dataset so the demo works
// without uploading each file by hand:
//   npx tsx src/scripts/seedSops.ts <datasetId> [fileNamePrefix]
// e.g. a refund dataset:  seedSops.ts <id> refund
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "../lib/prisma";
import { ingestDocument } from "../services/document.service";

const [datasetId, prefix = ""] = process.argv.slice(2);
if (!datasetId) {
  console.error("Usage: seedSops.ts <datasetId> [fileNamePrefix]");
  process.exit(1);
}

async function main() {
  const dataset = await prisma.dataset.findUnique({ where: { id: datasetId! } });
  if (!dataset) throw new Error(`Dataset ${datasetId} not found`);

  const dir = join(process.cwd(), "data", "sops");
  const files = readdirSync(dir).filter((f) => f.endsWith(".md") && f.startsWith(prefix));

  for (const file of files) {
    // Skip files already ingested for this dataset so re-running is safe.
    const exists = await prisma.document.findFirst({
      where: { datasetId: dataset.id, fileName: file },
    });
    if (exists) {
      console.log(`skip   ${file} (already ingested)`);
      continue;
    }
    const doc = await ingestDocument(dataset.userId, readFileSync(join(dir, file)), file, undefined, dataset.id);
    console.log(`ingest ${file} -> ${doc.chunkCount} chunks`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
